import logging
import os
from platform import uname

from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from django.core.servers.basehttp import WSGIRequestHandler
from django.core.servers.basehttp import WSGIServer
from django.test.testcases import LiveServerThread
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromiumService
from selenium.webdriver.common.by import By
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
            options.add_argument("--headless")
            options.add_argument("--window-size=1920,1080")
            options.add_argument("--disable-gpu")
            cls.wait_time = 20
            cls.sleep_time = 2
        elif "microsoft" in uname().release:
            # Microsoft WSL
            options.binary_location = "/usr/bin/google-chrome-stable"
            options.add_argument("--enable-features=UseOzonePlatform")
            options.add_argument("--ozone-platform=wayland")
            cls.wait_time = 6
            cls.sleep_time = 1
        else:
            # Ubuntu Desktop, etc.
            cls.wait_time = 6
            cls.sleep_time = 1
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
            if not os.path.exists("screenshots"):
                os.makedirs("screenshots")
            screenshotfile = f"screenshots/{self._testMethodName}.png"
            logger.info(f"Saving {screenshotfile}")
            self.driver.save_screenshot(screenshotfile)
        return super().tearDown()

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        super().tearDownClass()

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
    username_input = self.driver.find_element(By.ID, "id_username")
    password_input = self.driver.find_element(By.ID, "id_password")
    submit_button = self.driver.find_element(By.CSS_SELECTOR, "button.submit")

    # Log in with the test user
    username_input.send_keys("testuser")
    password_input.send_keys("12345")
    submit_button.click()

    # Check that user has been logged in.
    user_dropdown = self.driver.find_element(By.CSS_SELECTOR, "div.user-dropdown")
    self.assertIn("Logged in as: testuser", user_dropdown.text)
