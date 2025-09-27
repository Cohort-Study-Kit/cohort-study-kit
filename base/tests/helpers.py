import logging
import os
import time
from platform import uname

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


class VerboseLiveServerTestCase(StaticLiveServerTestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @classmethod
    def setUpClass(cls):
        options = webdriver.ChromeOptions()
        if os.getenv("CI"):
            # Github Actions
            options.binary_location = "/usr/bin/google-chrome-stable"
            options.add_argument("--headless=new")
            options.add_argument("--window-size=1920,1080")
            options.add_argument("--disable-gpu")
            options.add_argument("--no-sandbox")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--disable-extensions")
            options.add_argument("--disable-background-timer-throttling")
            options.add_argument("--disable-backgrounding-occluded-windows")
            options.add_argument("--disable-renderer-backgrounding")
            cls.wait_time = 30
            cls.sleep_time = 3
            cls.max_retries = 3
        elif "microsoft" in uname().release:
            # Microsoft WSL
            options.binary_location = "/usr/bin/google-chrome-stable"
            options.add_argument("--enable-features=UseOzonePlatform")
            options.add_argument("--ozone-platform=wayland")
            cls.wait_time = 10
            cls.sleep_time = 2
            cls.max_retries = 2
        else:
            # Ubuntu Desktop, etc.
            cls.wait_time = 10
            cls.sleep_time = 2
            cls.max_retries = 2
        cls.driver = webdriver.Chrome(
            service=ChromiumService(
                ChromeDriverManager(chrome_type=ChromeType.GOOGLE).install(),
            ),
            options=options,
        )
        cls.driver.implicitly_wait(cls.wait_time)
        super().setUpClass()

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
            # Handle any open alerts before taking screenshot
            try:
                alert = self.driver.switch_to.alert
                alert.dismiss()
            except Exception as e:
                logger.warning(f"Dismiss alert not working: {e}")

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
                if attempt == max_retries - 1:
                    raise
                time.sleep(self.sleep_time)
                # If it's a stale element exception, we can't re-find it, so just raise the error
                if "stale" in str(e).lower():
                    raise e

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
    self.driver.get(self.live_server_url + "/")
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
