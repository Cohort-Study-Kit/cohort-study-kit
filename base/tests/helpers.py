import logging
import os
import time
from platform import uname
from urllib.error import URLError
from urllib.request import urlopen

from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from django.core.servers.basehttp import WSGIRequestHandler
from django.core.servers.basehttp import WSGIServer
from django.test.testcases import LiveServerThread
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromiumService
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.core.os_manager import ChromeType

logger = logging.getLogger(__name__)


def find_browser_binary():
    """Find a suitable browser binary for Selenium tests.

    Checks for Chrome/Chromium first, then falls back to Brave browser.
    Returns the path to the first found binary, or None if none found.
    """
    # Check for Chrome/Chromium first
    chrome_paths = [
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/usr/local/bin/google-chrome",
        "/usr/local/bin/chromium",
        "/snap/bin/chromium",
    ]

    for path in chrome_paths:
        if os.path.exists(path):
            logger.info(f"Found Chrome/Chromium browser at: {path}")
            return path

    # Fall back to Brave browser
    brave_paths = [
        "/usr/bin/brave-browser",
        "/usr/bin/brave",
        "/usr/local/bin/brave-browser",
        "/usr/local/bin/brave",
        "/snap/bin/brave",
    ]

    for path in brave_paths:
        if os.path.exists(path):
            logger.info(f"Found Brave browser at: {path}")
            return path

    logger.warning("No Chrome/Chromium or Brave browser found")
    return None


class VerboseLiveServerTestCase(StaticLiveServerTestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        # Wait for the server to be ready
        cls._wait_for_server_ready()

        options = webdriver.ChromeOptions()

        # Disable autofill and save prompts for all environments
        # These dialogs can overlap the page and interfere with tests
        prefs = {
            "credentials_enable_service": False,
            "profile.password_manager_enabled": False,
            "autofill.profile_enabled": False,
            "autofill.credit_card_enabled": False,
            "profile.default_content_setting_values.notifications": 2,
        }
        options.add_experimental_option("prefs", prefs)
        options.add_argument("--disable-save-password-bubble")

        if os.getenv("CI"):
            # Github Actions
            browser_binary = find_browser_binary()
            if browser_binary:
                options.binary_location = browser_binary
            options.add_argument("--headless=new")
            options.add_argument("--window-size=1920,1080")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--disable-gpu")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-software-rasterizer")
            options.add_argument("--disable-features=VizDisplayCompositor")
            options.add_argument("--enable-unsafe-swiftshader")
            # Additional stability flags for CI (avoid --single-process as it crashes in CI)
            options.add_argument("--disable-web-security")
            options.add_argument("--disable-site-isolation-trials")
            options.add_argument("--disable-blink-features=AutomationControlled")
            options.add_argument("--disable-background-timer-throttling")
            options.add_argument("--disable-backgrounding-occluded-windows")
            options.add_argument("--disable-renderer-backgrounding")
            options.add_argument("--disable-hang-monitor")
            options.add_argument("--disable-prompt-on-repost")
            options.add_argument("--disable-sync")
            options.add_argument("--force-color-profile=srgb")
            options.add_argument("--metrics-recording-only")
            options.add_argument("--no-first-run")
            options.add_argument("--safebrowsing-disable-auto-update")
            options.add_argument("--disable-default-apps")
            options.add_argument("--disable-component-update")
            # Use 'eager' page load strategy - wait for DOM but not all resources
            options.page_load_strategy = "eager"
            cls.wait_time = 30
            cls.sleep_time = 3
            cls.max_retries = 3
        elif "microsoft" in uname().release:
            # Microsoft WSL
            browser_binary = find_browser_binary()
            if browser_binary:
                options.binary_location = browser_binary
            options.add_argument("--enable-features=UseOzonePlatform")
            options.add_argument("--ozone-platform=wayland")
            cls.wait_time = 10
            cls.sleep_time = 2
            cls.max_retries = 2
        else:
            # Ubuntu Desktop, etc.
            browser_binary = find_browser_binary()
            if browser_binary:
                options.binary_location = browser_binary
            cls.wait_time = 10
            cls.sleep_time = 2
            cls.max_retries = 2
        # Use ChromeType.GOOGLE for all browsers since Chrome/Chromium/Brave are compatible
        # The binary_location in options determines which actual browser runs
        driver_path = ChromeDriverManager(chrome_type=ChromeType.GOOGLE).install()
        cls.driver = webdriver.Chrome(
            service=ChromiumService(driver_path),
            options=options,
        )
        cls.driver.implicitly_wait(cls.wait_time)
        # Set page load timeout to prevent hanging
        cls.driver.set_page_load_timeout(120)
        # Set script timeout - lower in CI to fail fast
        script_timeout = 30 if os.getenv("CI") else 60
        cls.driver.set_script_timeout(script_timeout)

        # Verify driver is working
        try:
            logger.info("Chrome driver created, checking session...")
            session_id = cls.driver.session_id
            logger.info(f"Chrome session ID: {session_id}")
            current_url = cls.driver.current_url
            logger.info(f"Chrome current URL: {current_url}")
        except Exception as e:
            logger.error(f"Chrome driver failed health check: {e}")
            raise Exception(f"Chrome driver is not responding: {e}") from e

    @classmethod
    def _wait_for_server_ready(cls, max_attempts=10, delay=1):
        """Wait for the Django test server to be ready to accept connections."""
        for attempt in range(max_attempts):
            try:
                # Try to connect to the server
                with urlopen(cls.live_server_url, timeout=5) as response:
                    response.read()
                logger.info(f"Server is ready at {cls.live_server_url}")
                return
            except (URLError, OSError) as e:
                if attempt < max_attempts - 1:
                    logger.info(
                        f"Server not ready yet, waiting... (attempt {attempt + 1}/{max_attempts})",
                    )
                    time.sleep(delay)
                else:
                    logger.error(
                        f"Server failed to become ready after {max_attempts} attempts",
                    )
                    raise Exception(f"Django test server did not start properly: {e}")

    def tearDown(self):
        # Source: https://stackoverflow.com/a/39606065
        if hasattr(self._outcome, "errors"):
            # Python 3.4 - 3.10  (These two methods have no side effects)
            result = self.defaultTestResult()
            self._feedErrorsToResult(result, self._outcome.errors)
        else:
            # Python 3.11+
            result = self._outcome.result
        ok = all(test != self for test, text in result.errors + result.failures)
        if not ok:
            # Handle any open alerts before taking screenshot (if any exist)
            try:
                alert = self.driver.switch_to.alert
                alert.dismiss()
            except Exception:
                # No alert present - this is normal for most tests
                pass

            if not os.path.exists("screenshots"):
                os.makedirs("screenshots")
            screenshotfile = f"screenshots/{self._testMethodName}.png"
            logger.info(f"Saving {screenshotfile}")
            try:
                self.driver.save_screenshot(screenshotfile)
            except Exception as e:
                logger.warning(f"Failed to save screenshot: {e}")
        return super().tearDown()

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        super().tearDownClass()

    def wait_for_element(self, by, value, timeout=None):
        """Wait for element to be present and visible."""
        if timeout is None:
            timeout = self.wait_time
        return WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located((by, value)),
        )

    def wait_for_element_clickable(self, by, value, timeout=None):
        """Wait for element to be clickable."""
        if timeout is None:
            timeout = self.wait_time
        return WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable((by, value)),
        )

    def safe_click(self, element, max_retries=None):
        """Safely click an element with retry logic."""
        if max_retries is None:
            max_retries = self.max_retries

        for attempt in range(max_retries):
            try:
                # Scroll element into view
                self.driver.execute_script(
                    "arguments[0].scrollIntoView({block: 'center'});",
                    element,
                )
                # Wait for element to be clickable
                WebDriverWait(self.driver, self.wait_time).until(
                    EC.element_to_be_clickable(element),
                )
                element.click()
                return
            except Exception as e:
                # If click is intercepted, try JavaScript click as fallback
                if "intercepted" in str(e).lower():
                    try:
                        logger.info(
                            "Click intercepted, using JavaScript click as fallback",
                        )
                        self.driver.execute_script("arguments[0].click();", element)
                        return
                    except Exception as js_error:
                        logger.warning(f"JavaScript click also failed: {js_error}")
                        if attempt == max_retries - 1:
                            raise
                elif attempt == max_retries - 1:
                    raise

                time.sleep(self.sleep_time)
                # If it's a stale element exception, we can't re-find it, so just raise the error
                if "stale" in str(e).lower():
                    raise e

    def safe_get(self, url, max_retries=None):
        """Safely navigate to a URL with retry logic."""
        if max_retries is None:
            max_retries = self.max_retries

        for attempt in range(max_retries):
            try:
                logger.info(
                    f"Attempting to load URL: {url} (attempt {attempt + 1}/{max_retries})",
                )
                # Check if driver session is still valid
                try:
                    session_id = self.driver.session_id
                    logger.info(f"Driver session ID: {session_id}")
                except Exception as session_error:
                    logger.error(f"Driver session is invalid: {session_error}")
                    raise Exception(
                        f"Chrome session is not valid: {session_error}",
                    ) from session_error

                # Navigate to the URL (with page_load_strategy='eager', waits for DOM ready)
                self.driver.get(url)
                logger.info(f"Navigation command sent to {url}")

                # Give the page a moment to stabilize after DOM ready
                time.sleep(1)

                # Verify we navigated successfully
                current_url = self.driver.current_url
                logger.info(f"Successfully loaded URL: {url} (current: {current_url})")
                return
            except Exception as e:
                logger.error(
                    f"Failed to load URL on attempt {attempt + 1}: {type(e).__name__}: {str(e)}",
                )
                import traceback

                logger.error(f"Traceback: {traceback.format_exc()}")
                if attempt == max_retries - 1:
                    logger.error(
                        f"Failed to load URL after {max_retries} attempts: {url}",
                    )
                    raise
                time.sleep(self.sleep_time)

    class VersboseLiveServerThread(LiveServerThread):
        def _create_server(self, connections_override=None):
            WSGIRequestHandler.handle = WSGIRequestHandler.handle_one_request
            return WSGIServer(
                (self.host, self.port),
                WSGIRequestHandler,
                allow_reuse_address=False,
            )

    server_thread_class = VersboseLiveServerThread


def login_testuser(self):
    self.safe_get(self.live_server_url + "/")
    username_input = self.wait_for_element(By.ID, "id_username")
    password_input = self.wait_for_element(By.ID, "id_password")
    submit_button = self.wait_for_element_clickable(By.CSS_SELECTOR, "button.submit")

    # Log in with the test user
    username_input.send_keys("testuser")
    password_input.send_keys("12345")
    submit_button.click()

    # Check that user has been logged in.
    user_dropdown = self.wait_for_element(By.CSS_SELECTOR, "div.user-dropdown")
    self.assertIn("Logged in as: testuser", user_dropdown.text)
