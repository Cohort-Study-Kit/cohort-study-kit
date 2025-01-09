import time

from django.contrib.auth import get_user_model
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.select import Select
from selenium.webdriver.support.ui import WebDriverWait

from .helpers import login_testuser
from .helpers import VerboseLiveServerTestCase

# from selenium.webdriver.common.action_chains import ActionChains

# from datetime import timedelta


class InteractionTest(VerboseLiveServerTestCase):
    fixtures = ["test_database"]

    def setUp(self):
        super().setUp()
        User = get_user_model()
        self.user = User.objects.create_user(
            username="testuser",
            password="12345",
            is_staff=True,
        )
        self.action = ActionChains(self.driver)
        self.driver.maximize_window()
        self.driver.get(self.live_server_url + "/")

    def test_interaction(self):
        # -------------------- Login test --------------------
        username_input = self.driver.find_element(By.ID, "id_username")
        password_input = self.driver.find_element(By.ID, "id_password")
        submit_button = self.driver.find_element(By.CSS_SELECTOR, "button.submit")

        # Try to log in with a non-existing user account.
        username_input.send_keys("non_existing")
        password_input.send_keys("user")
        submit_button.click()
        time.sleep(self.sleep_time)
        wrong_login_alert = self.driver.switch_to.alert
        self.assertEqual(wrong_login_alert.text, "Wrong login, please try again.")
        wrong_login_alert.accept()

        # page has reloaded, we need to find elements again.
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

        # Try to log the user out again.
        logout_menu_item = self.driver.find_element(By.ID, "id_logout")
        ActionChains(self.driver).move_to_element(user_dropdown).click(
            logout_menu_item,
        ).perform()

        # Wait for next page to load
        WebDriverWait(self.driver, self.wait_time).until(EC.url_contains("/login"))

        # Attempt to go to search proband directly via url
        self.driver.get(self.live_server_url + "/?proband=1111")

        # Check that login is required
        headline = self.driver.find_element(By.ID, "login_required").text
        self.assertEqual(headline, "Login required")

        login_testuser(self)

        self.driver.find_element(By.ID, "probands").send_keys("1111\n")

        # Wait for next page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "#diagnosis tbody")),
        )

        # -------------------- Diagnose test --------------------
        # Check that 'J45901' (ICD10) appears in the diagnose table.
        diagnose_table_text = self.driver.find_element(By.ID, "diagnosis").text
        self.assertIn("J45901", diagnose_table_text)

        # Test diagnose view
        self.driver.find_element(By.CSS_SELECTOR, "#diagnosis .plus-button").click()

        self.driver.find_element(
            By.CSS_SELECTOR,
            "a[href='/diagnosis/create/1111/']",
        ).click()

        # Wait for next page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("/diagnosis/create/"),
        )

        # Check diagnose is created for the correct proband
        self.assertEqual(
            self.driver.find_element(By.CSS_SELECTOR, "h3").text,
            "Create New Diagnosis for TestPernille Miracle (1111)",
        )

        # Test create new diagnose with only required fields
        startdate_field = self.driver.find_element(By.ID, "id_start_date")
        startdate_field.click()
        startdate_field.send_keys("10102022")

        adverse_event_checkbox = self.driver.find_element(By.ID, "id_adverse_event")
        adverse_event_checkbox.click()

        diagnose_selector = self.driver.find_element(By.CSS_SELECTOR, "div.choices")
        diagnose_selector.click()
        diagnose_field = self.driver.find_element(
            By.CSS_SELECTOR,
            "div.choices input[type=search]",
        )
        diagnose_field.send_keys("j")
        diagnose_field.send_keys("4")
        diagnose_field.send_keys("5")
        time.sleep(self.sleep_time)
        diagnose_field.send_keys(Keys.ENTER)

        comments_field = self.driver.find_element(By.ID, "id_comments")
        comments_field.click()
        comments_field.send_keys("This is a new diagnosis")

        # Save new diagnose
        time.sleep(self.sleep_time)
        submit_button = self.driver.find_element(By.ID, "submit")
        submit_button.click()
        # Wait for overview page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "a[href='/diagnosis/create/1111/']"),
            ),
        )

        self.driver.find_element(By.CSS_SELECTOR, "a.home").click()

        # With all required filled in save should work. Wait for next page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "#diagnosis tbody")),
        )

        # Check that the new diagnosis has been added
        diagnosis_table = self.driver.find_element(By.ID, "diagnosis")
        self.assertIn("10‑10‑2022", diagnosis_table.text)

        # Test delete diagnosis
        diagnosis_table = self.driver.find_element(By.ID, "diagnosis")
        diagnosis_table_rows = diagnosis_table.find_elements(By.TAG_NAME, "tr")
        number_of_rows = len(diagnosis_table_rows)
        ActionChains(self.driver).click(diagnosis_table_rows[3]).key_down(
            Keys.DELETE,
        ).perform()

        # The logged in user is is_staff and therefore it should be possible to delete diagnosis.
        delete_alert = self.driver.switch_to.alert
        self.assertEqual(
            delete_alert.text,
            "Are you sure you want to delete diagnosis: Astma",
        )
        delete_alert.accept()
        time.sleep(self.sleep_time)

        diagnosis_table = self.driver.find_element(By.ID, "diagnosis")
        diagnosis_table_rows = diagnosis_table.find_elements(
            By.CSS_SELECTOR,
            "tbody tr",
        )
        ActionChains(self.driver).click(diagnosis_table_rows[3]).key_down(
            Keys.DELETE,
        ).perform()
        delete_alert = self.driver.switch_to.alert
        self.assertEqual(
            delete_alert.text,
            "Are you sure you want to delete diagnosis: Asthma under evaluation",
        )
        delete_alert.accept()
        time.sleep(self.sleep_time)
        diagnosis_table_new = self.driver.find_element(By.ID, "diagnosis")
        diagnosis_table_rows_new = diagnosis_table_new.find_elements(By.TAG_NAME, "tr")
        number_of_rows_new = len(diagnosis_table_rows_new)
        self.assertEqual(number_of_rows - 2, number_of_rows_new)

        # Test update diagnosis
        diagnosis_table_rows = diagnosis_table.find_elements(By.TAG_NAME, "tr")
        for row in diagnosis_table_rows:
            if "10‑10‑2022" in row.text:
                ActionChains(self.driver).double_click(row).perform()
                break

        # Wait for next page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("/diagnosis/update/"),
        )

        # Check the correct diagnosis is opened
        comments_field = self.driver.find_element(By.ID, "id_comments")
        self.assertEqual(
            comments_field.get_attribute("value"),
            "This is a new diagnosis",
        )
        comments_field.click()
        comments_field.clear()
        comments_field.send_keys("Updated the diagnosis")

        startdate_field = self.driver.find_element(By.ID, "id_start_date")
        startdate_field.click()
        startdate_field.clear()
        startdate_field.send_keys("11102023")
        startdate_field.send_keys(Keys.ENTER)

        enddate_field = self.driver.find_element(By.ID, "id_end_date")
        enddate_field.click()
        enddate_field.send_keys("15/12/2022")
        enddate_field.send_keys(Keys.ENTER)
        time.sleep(self.sleep_time)

        # The start date was before the end date, so the start date should have be adjusted.
        self.assertEqual("15-12-2022", enddate_field.get_attribute("value"))
        self.assertEqual("15-12-2022", startdate_field.get_attribute("value"))
        duration_field = self.driver.find_element(By.ID, "id_duration")
        duration_field.click()
        duration_field.send_keys("2")
        duration_field.send_keys(Keys.TAB)
        time.sleep(self.sleep_time)
        # A "2" was added at the end of the duration so it is now "12", so the end date should be adjusted.
        self.assertEqual("26-12-2022", enddate_field.get_attribute("value"))

        # Set startdate to 11/10/2023 again.
        startdate_field.click()
        startdate_field.clear()
        startdate_field.send_keys("11/10/2023")
        startdate_field.send_keys(Keys.ENTER)

        # Remove contents of the end date field.
        enddate_field.click()
        enddate_field.clear()
        enddate_field.send_keys(Keys.ENTER)

        # The duration should now be empty.
        self.assertEqual("", duration_field.get_attribute("value"))

        diagnose_selector = self.driver.find_element(By.CSS_SELECTOR, "div.choices")
        diagnose_selector.click()
        diagnose_field = self.driver.find_element(
            By.CSS_SELECTOR,
            "div.choices input[type=search]",
        )
        diagnose_field.clear()
        diagnose_field.click()
        diagnose_field.send_keys("arveli")
        time.sleep(self.sleep_time)
        diagnose_field.send_keys(Keys.ENTER)

        # Save updated diagnose data
        time.sleep(self.sleep_time)
        submit_button = self.driver.find_element(By.ID, "submit")
        submit_button.click()
        # Wait for overview page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "a[href='/diagnosis/create/1111/']"),
            ),
        )
        self.driver.find_element(By.CSS_SELECTOR, "a.home").click()

        # Wait for next page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "#diagnosis tbody")),
        )
        # Check the diagnosis is updated
        diagnosis_table = self.driver.find_element(By.ID, "diagnosis")
        self.assertIn("11‑10‑2023", diagnosis_table.text)

        # -------------------- Medication test --------------------

        # ##### Test create medication #####
        self.driver.find_element(
            By.CSS_SELECTOR,
            "#medication thead a.plus-button",
        ).click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "a[href='/medication/create/1111/']"),
            ),
        ).click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("/medication/create/1111/"),
        )

        startdate_field = self.driver.find_element(By.ID, "id_start_date")
        startdate_field.send_keys("01.10.2022")
        startdate_field.send_keys(Keys.ENTER)

        duration_field = self.driver.find_element(By.ID, "id_duration")
        duration_field.send_keys("10")
        duration_field.send_keys(Keys.TAB)
        time.sleep(self.sleep_time)
        # Duration was set to "10" so the end date should be adjusted.
        enddate_field = self.driver.find_element(By.ID, "id_end_date")
        self.assertEqual("10-10-2022", enddate_field.get_attribute("value"))

        # Remove contents of the end date field.
        enddate_field.click()
        enddate_field.clear()
        enddate_field.send_keys(Keys.ENTER)
        time.sleep(self.sleep_time)

        # The duration should now be empty.
        self.assertEqual("", duration_field.get_attribute("value"))

        dose_field = self.driver.find_element(By.ID, "id_dose")
        dose_field.send_keys("2")

        mother_field = self.driver.find_element(By.ID, "id_source_type")
        mother_field.click()

        medication_field = self.driver.find_element(By.XPATH, '//div[@class="choices"]')
        medication_field.click()

        medication_search = medication_field.find_element(By.XPATH, ".//input")
        medication_search.send_keys("A")
        medication_search.send_keys("0")
        medication_search.send_keys("2")

        # Scrolling the medication list
        medication_list = medication_field.find_element(
            By.XPATH,
            './/div[@class="choices__list" and @role="listbox"]',
        )
        self.driver.execute_script("arguments[0].scrollBy(0,200)", medication_list)
        self.driver.execute_script("arguments[0].scrollBy(0,200)", medication_list)
        self.driver.execute_script("arguments[0].scrollBy(0,200)", medication_list)
        self.driver.execute_script("arguments[0].scrollBy(0,200)", medication_list)
        self.driver.execute_script("arguments[0].scrollBy(0,-600)", medication_list)
        self.driver.execute_script("arguments[0].scrollTo(0,0)", medication_list)

        medication_choice = medication_list.find_element(
            By.XPATH,
            './/div[contains(text(),"A02AD01OR Alminox")]',
        )
        medication_choice.click()

        pn_field = self.driver.find_element(By.ID, "id_pn")
        pn_field.click()

        ordination_field = self.driver.find_element(By.ID, "id_ordination_comment")
        ordination_field.click()
        ordination_select = Select(
            self.driver.find_element(By.ID, "id_ordination_comment"),
        )
        ordination_select.select_by_visible_text("Prematurely stopped by parents")

        period_field = self.driver.find_element(By.ID, "id_period")
        period_field.click()
        period_select = Select(self.driver.find_element(By.ID, "id_period"))
        period_select.select_by_visible_text("Week")

        comments_field = self.driver.find_element(By.ID, "id_comments")
        comments_field.click()
        comments_field.send_keys("Selenium create medication.")

        submit_button = self.driver.find_element(By.ID, "submit")
        submit_button.click()
        # Wait for overview page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "a[href='/medication/create/1111/']"),
            ),
        )
        self.driver.find_element(By.CSS_SELECTOR, "a.home").click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("proband/1111"),
        )

        # ##### Verify created medication #####
        created_row = self.driver.find_element(
            By.XPATH,
            '//div[@id="medication"]//tbody//tr[./td[contains(text(), "A02AD01OR")]]',
        )
        atc_code = created_row.find_element(By.XPATH, ".//td[2]").text
        self.assertEqual("A02AD01OR", atc_code)
        startdate = created_row.find_element(By.XPATH, ".//td[3]").text
        self.assertEqual("01‑10‑2022", startdate)

        # ##### Test update medication #####
        # Verify that medication "Canesten" exists
        medication_row = self.driver.find_element(
            By.XPATH,
            '//div[@id="medication"]//tbody//tr[@data-id="31"]',
        )
        medication = medication_row.find_element(By.XPATH, ".//td[1]").text
        self.assertEqual("Canesten", medication)

        medication_row.click()
        self.action.double_click(medication_row).perform()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("medication/update"),
        )

        startdate_field = self.driver.find_element(By.ID, "id_start_date")
        startdate_field.clear()
        startdate_field.send_keys("01.08.2022")
        startdate_field.send_keys(Keys.ENTER)

        enddate_field = self.driver.find_element(By.ID, "id_end_date")
        enddate_field.send_keys("01.10.2022")
        enddate_field.send_keys(Keys.ENTER)

        duration_field = self.driver.find_element(By.ID, "id_duration")
        duration_field.clear()
        duration_field.send_keys("10")

        dose_field = self.driver.find_element(By.ID, "id_dose")
        dose_field.clear()
        dose_field.send_keys("1")

        comments_field = self.driver.find_element(By.ID, "id_comments")
        comments_field.click()
        comments_field.send_keys("Selenium update medication.")

        submit_button = self.driver.find_element(By.ID, "submit")
        submit_button.click()

        # Wait for overview page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "a[href='/medication/create/1111/']"),
            ),
        )

        # ##### Verify updated medication #####
        updated_row = self.driver.find_element(
            By.XPATH,
            '//table//tbody//tr[./td[contains(text(), "01‑08‑2022")]]',
        )
        enddate = updated_row.find_element(By.XPATH, ".//td[2]").text
        self.assertEqual("10‑08‑2022", enddate)

        # Go back to home view
        self.driver.find_element(By.CSS_SELECTOR, "a.home").click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("proband/1111"),
        )

        # -------------------- Probandnote test --------------------
        # Test writing a proband note.
        self.driver.find_element(
            By.CSS_SELECTOR,
            "#notes button.add-note",
        ).click()
        time.sleep(self.sleep_time)
        probandnote_input = self.driver.find_element(By.CSS_SELECTOR, ".note textarea")
        probandnote_input.click()
        probandnote_input.send_keys("A PROBAND TEST NOTE")
        ActionChains(self.driver).move_to_element(probandnote_input).perform()
        # Click save button
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".note button.save")),
        ).click()

        time.sleep(self.sleep_time)

        # Check that new proband note is present and that the contents have been saved.
        probandnotes_el = self.driver.find_element(By.ID, "notes")
        self.assertIn("A PROBAND TEST NOTE", probandnotes_el.text)

        # Make sure that there are now two note input forms
        probandnote_inputs = self.driver.find_elements(
            By.CSS_SELECTOR,
            ".note textarea",
        )
        self.assertEqual(len(probandnote_inputs), 2)

        # Enable editing of proband note:
        self.driver.find_element(
            By.CSS_SELECTOR,
            "#notes button.edit-note",
        ).click()

        # Add text to the existing proband note and update it.
        existing_probandnote_input = probandnote_inputs[1]
        existing_probandnote_input.click()
        existing_probandnote_input.send_keys(" HAS BEEN UPDATED")

        # Click save button
        save_button = self.driver.find_element(
            By.CSS_SELECTOR,
            "#notes div.note:not(.disabled):not(.hidden) button.save",
        )
        save_button.click()
        change_note_alert = self.driver.switch_to.alert
        change_note_alert.accept()
        time.sleep(self.sleep_time)

        # Check that proband note has been updated.
        probandnotes_el = self.driver.find_element(By.ID, "notes")
        self.assertIn("A PROBAND TEST NOTE HAS BEEN UPDATED", probandnotes_el.text)

        # Make sure that there are still two note input forms
        probandnote_inputs = self.driver.find_elements(
            By.CSS_SELECTOR,
            ".note textarea",
        )
        self.assertEqual(len(probandnote_inputs), 2)

        # Delete a proband note by removing all text from it.
        self.driver.find_element(
            By.CSS_SELECTOR,
            "#notes button.edit-note",
        ).click()
        existing_probandnote_input = probandnote_inputs[1]
        existing_probandnote_input.clear()
        existing_probandnote_input.click()

        # Save
        save_button = self.driver.find_element(
            By.CSS_SELECTOR,
            "#notes div.note:not(.disabled):not(.hidden) button.save",
        )
        save_button.click()

        # Accept alert
        self.driver.switch_to.alert.accept()
        time.sleep(self.sleep_time)

        # Make sure that there is only one note input form
        probandnote_inputs = self.driver.find_elements(
            By.CSS_SELECTOR,
            ".note textarea",
        )
        self.assertEqual(len(probandnote_inputs), 1)

        # -------------------- Relative test --------------------
        # Test relative view
        self.driver.find_element(By.CSS_SELECTOR, "a.create-relative").click()

        # Wait for next page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("/relative/create/"),
        )

        # Check relative is created for the correct proband
        self.assertEqual(
            self.driver.find_element(By.CSS_SELECTOR, "h3").text,
            "Create New Relative",
        )

        # Test create new relative with only required fields
        first_name_field = self.driver.find_element(By.ID, "firstname")
        first_name_field.click()
        first_name_field.send_keys("Test first name")

        last_name_field = self.driver.find_element(By.ID, "lastname")
        last_name_field.click()
        last_name_field.send_keys("Test last name")

        cpr_number_field = self.driver.find_element(By.ID, "cpr")
        cpr_number_field.click()
        cpr_number_field.send_keys("31122012-1212")

        birth_date_field = self.driver.find_element(By.ID, "birthdate")
        birth_date_field.click()
        birth_date_field.send_keys("31122012")
        birth_date_field.send_keys(Keys.ENTER)

        relation_type_select = self.driver.find_element(By.ID, "relation_type")
        relation_type_select_object = Select(relation_type_select)
        relation_type_select_object.select_by_visible_text("Mother")

        submit_button = self.driver.find_element(By.ID, "submit")
        self.driver.execute_script("arguments[0].scrollIntoView();", submit_button)
        time.sleep(self.sleep_time)
        submit_button.click()

        # With all required filled in save should work. Wait for next page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "#relatives tbody")),
        )
        time.sleep(self.sleep_time)
        # Check the new relative is added
        relative_table = self.driver.find_element(By.ID, "relatives")
        self.assertIn("Test first name", relative_table.text)

        # Test update relative
        relative_table_rows = relative_table.find_elements(By.TAG_NAME, "tr")
        for row in relative_table_rows:
            if "Test first name" in row.text:
                ActionChains(self.driver).double_click(row).perform()
                break

        # Wait for page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("/relative/update/"),
        )

        # Change previously saved values
        first_name_field = self.driver.find_element(By.ID, "firstname")
        self.assertEqual(first_name_field.get_attribute("value"), "Test first name")
        first_name_field.click()
        first_name_field.clear()
        first_name_field.send_keys("First name worked")

        last_name_field = self.driver.find_element(By.ID, "lastname")
        last_name_field.click()
        last_name_field.clear()
        last_name_field.send_keys("Last name worked")

        cpr_number_field = self.driver.find_element(By.ID, "cpr")
        cpr_number_field.click()
        cpr_number_field.clear()
        cpr_number_field.send_keys("11112011-1111")

        birth_date_field = self.driver.find_element(By.ID, "birthdate")
        birth_date_field.click()
        birth_date_field.clear()
        birth_date_field.send_keys("11112011")

        relation_type_select = self.driver.find_element(By.ID, "relation_type")
        relation_type_select_object = Select(relation_type_select)
        relation_type_select_object.select_by_visible_text("Father")

        # Test some more input fields
        dead_checkbox = self.driver.find_element(By.ID, "dead")
        dead_checkbox.click()

        deathdate_field = self.driver.find_element(By.ID, "deathdate")
        deathdate_field.click()
        deathdate_field.send_keys("12122012")
        deathdate_field.send_keys(Keys.ENTER)

        comments_field = self.driver.find_element(By.ID, "comments")
        comments_field.click()
        comments_field.send_keys("This is an automated selenium test")

        submit_button = self.driver.find_element(By.ID, "submit")
        self.driver.execute_script("arguments[0].scrollIntoView();", submit_button)
        time.sleep(self.sleep_time)
        submit_button.click()

        # Wait for next page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("proband/1111/"),
        )

        # Check the relative data has been updated
        relative_table = self.driver.find_element(By.ID, "relatives")
        time.sleep(self.sleep_time)
        self.assertIn("First name worked", relative_table.text)
        self.assertIn("Last name worked", relative_table.text)
        self.assertIn("Father", relative_table.text)

        # -------------------- Address test --------------------
        # Test create new address
        address_overview_btn = self.driver.find_element(
            By.CSS_SELECTOR,
            "a.create-address",
        )
        address_overview_btn.click()

        # Wait for new page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("address/1111"),
        )

        # Test create new address
        add_address_btn = self.driver.find_element(By.ID, "add-address")
        add_address_btn.click()

        # Wait for new page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("address/create/1111"),
        )

        startdate_field = self.driver.find_element(By.ID, "id_start_date")
        startdate_field.click()
        startdate_field.send_keys("13112022")
        startdate_field.send_keys(Keys.ENTER)

        primary_home_checkbox = self.driver.find_element(By.ID, "id_primary_home")
        primary_home_checkbox.click()

        street_field = self.driver.find_element(By.ID, "id_street")
        street_field.click()
        street_field.send_keys("Copsac vej 123")

        postcode_field = self.driver.find_element(By.ID, "id_postcode")
        postcode_field.click()
        postcode_field.send_keys("2820")

        hometype_select = self.driver.find_element(By.ID, "id_home_type")
        hometype_select_object = Select(hometype_select)
        hometype_select_object.select_by_visible_text("Apartment")

        liveswith_select = self.driver.find_element(By.ID, "id_lives_with")
        liveswith_select_object = Select(liveswith_select)
        liveswith_select_object.select_by_visible_text("None of the biological parents")

        country_select = self.driver.find_element(By.ID, "id_country")
        country_select_object = Select(country_select)
        country_select_object.select_by_visible_text("Germany")

        time.sleep(self.sleep_time)

        province_select = self.driver.find_element(By.ID, "id_province")
        province_select_object = Select(province_select)
        province_select_object.select_by_visible_text("Hamburg")

        submit_button = self.driver.find_element(By.ID, "submit")
        self.driver.execute_script("arguments[0].scrollIntoView();", submit_button)
        time.sleep(self.sleep_time)
        submit_button.click()

        # Wait for next page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("address/1111"),
        )

        # Check new address is added
        new_address_link = self.driver.find_element(By.CSS_SELECTOR, "table tbody tr")
        self.assertIn("Copsac vej 123", new_address_link.text)
        time.sleep(self.sleep_time)
        new_address_link.click()

        # # Test update address info
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("address/update/1111"),
        )

        enddate_field = self.driver.find_element(By.ID, "id_end_date")
        enddate_field.click()
        enddate_field.send_keys("21112022")
        enddate_field.send_keys(Keys.ENTER)

        primary_home_checkbox = self.driver.find_element(By.ID, "id_primary_home")
        primary_home_checkbox.click()

        email_father = self.driver.find_element(By.ID, "id_cellphone_father")
        email_father.click()
        email_father.send_keys("0066600")

        submit_button = self.driver.find_element(By.ID, "submit")
        self.driver.execute_script("arguments[0].scrollIntoView();", submit_button)
        time.sleep(self.sleep_time)
        submit_button.click()

        # Check address is updated
        updated_address_link = self.driver.find_elements(
            By.CSS_SELECTOR,
            "table tbody tr",
        )[0]
        self.assertIn("0066600", updated_address_link.text)

        # Go back to home page
        back_btn = self.driver.find_element(By.ID, "back")
        back_btn.click()

        # Wait for home page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("proband/1111"),
        )

        # -------------------- Instituiton test --------------------
        # Test create new institution
        institution_overview_btn = self.driver.find_element(
            By.CSS_SELECTOR,
            "a.create-institution",
        )
        institution_overview_btn.click()

        # Wait for next page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("institution/1111"),
        )

        add_institution_btn = self.driver.find_element(
            By.ID,
            "add-education-institution",
        )
        add_institution_btn.click()

        # Wait for next page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("institution/create/1111"),
        )

        startdate_field = self.driver.find_element(By.ID, "id_start_date")
        startdate_field.click()
        startdate_field.send_keys("20092022")
        startdate_field.send_keys(Keys.ENTER)

        institution_type_field = self.driver.find_element(By.ID, "id_type")
        institution_type_select = Select(institution_type_field)
        institution_type_select.select_by_visible_text("Nursery")

        street_field = self.driver.find_element(By.ID, "id_street")
        street_field.click()
        street_field.send_keys("Vuggestue vej 12")

        postcode_field = self.driver.find_element(By.ID, "id_postcode")
        postcode_field.click()
        postcode_field.send_keys("3400")

        country_select = self.driver.find_element(By.ID, "id_country")
        country_select_object = Select(country_select)
        country_select_object.select_by_visible_text("United Kingdom")

        time.sleep(self.sleep_time)

        province_select = self.driver.find_element(By.ID, "id_province")
        province_select_object = Select(province_select)
        province_select_object.select_by_visible_text("Isle of Man")

        submit_button = self.driver.find_element(By.ID, "submit")
        self.driver.execute_script("arguments[0].scrollIntoView();", submit_button)
        time.sleep(self.sleep_time)
        submit_button.click()

        # Wait for next page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("institution/1111"),
        )

        # Check new instituion is added
        new_institution_link = self.driver.find_element(
            By.CSS_SELECTOR,
            "table tbody tr",
        )
        self.assertIn("Vuggestue vej 12", new_institution_link.text)
        time.sleep(self.sleep_time)
        new_institution_link.click()

        # Test update institution data
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("institution/update/1111"),
        )

        furred_animal_field = self.driver.find_element(By.ID, "id_other_furred_animal")
        furred_animal_select = Select(furred_animal_field)
        furred_animal_select.select_by_visible_text("Yes")

        dog_field = self.driver.find_element(By.ID, "id_dog")
        dog_select = Select(dog_field)
        dog_select.select_by_visible_text("Yes")

        comments_field = self.driver.find_element(By.ID, "id_comments")
        comments_field.click()
        comments_field.send_keys("The dog might be a horse")

        submit_button = self.driver.find_element(By.ID, "submit")
        self.driver.execute_script("arguments[0].scrollIntoView();", submit_button)
        time.sleep(self.sleep_time)
        submit_button.click()

        # Check instituiton data is updated
        updated_institution_link = self.driver.find_element(
            By.CSS_SELECTOR,
            "table tbody tr",
        )
        self.assertIn("a horse", updated_institution_link.text)
        time.sleep(self.sleep_time)

        back_btn = self.driver.find_element(By.ID, "back")
        back_btn.click()

        # Wait for home page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("proband/1111"),
        )

        # -------------------- Event / Examination / Cell test --------------------
        # Select a Visit (select "10 yrs" here) before we test interaction with Examinations.
        visit_table = self.driver.find_element(
            By.CSS_SELECTOR,
            "#visits .datatable-container",
        )
        self.assertIn("10 yrs", visit_table.text)
        visit_row = visit_table.find_element(By.TAG_NAME, "tbody").find_element(
            By.XPATH,
            './/tr[./td[text()="10 yrs"]]',
        )
        visit_row.click()
        time.sleep(self.sleep_time)

        # ##### Test sorting Examinations #####
        mdv_headers = self.driver.find_elements(
            By.XPATH,
            '//div[@id="examinations-list"]//thead//tr//button[@class="datatable-sorter"]',
        )
        for sorter in mdv_headers:
            sorter.click()

        # ##### Continue to Examination tests. Now test creating new Examination. #####
        create = self.driver.find_element(
            By.CSS_SELECTOR,
            "#examinations-list .plus-button",
        )
        create.click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("/examination/create/1111/93/"),
        )

        # Extra verification that it is actually 10 yrs
        # (in case we change primary key of the particular "10 yrs" Visit in our test data)
        visit_type = self.driver.find_element(By.ID, "fk_visit").get_attribute(
            "value",
        )
        self.assertIn("10 yrs", visit_type)

        # Fill up the remaining fields
        dataset_field = Select(self.driver.find_element(By.ID, "fk_dataset"))
        dataset_field.select_by_visible_text("Mbw")

        startdate_field = self.driver.find_element(By.ID, "id_start_date")
        startdate_field.click()
        startdate_field.send_keys("01-01-2022")
        startdate_field.send_keys(Keys.ENTER)

        status_field = Select(self.driver.find_element(By.ID, "id_status"))
        status_field.select_by_visible_text("Planned")

        comments_field = self.driver.find_element(By.ID, "id_comments")
        comments_field.click()
        comments_field.send_keys("Create examination.")
        time.sleep(self.sleep_time)

        # Save and back to front page
        submit_button = self.driver.find_element(By.ID, "submit")
        self.driver.execute_script("arguments[0].scrollIntoView();", submit_button)
        time.sleep(self.sleep_time)
        submit_button.click()

        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("proband/1111"),
        )

        # ##### Verify created Examination #####
        # Part I: verify via Examination (even-list) box, here only relation data (Examination fields) can be verified.
        created_row = self.driver.find_element(
            By.XPATH,
            '//div[@id="examinations-list"]//tbody//tr[./td[contains(text(), "Create examination.")]]',
        )
        dataset = created_row.find_element(By.XPATH, ".//td[1]").text
        self.assertEqual("Mbw", dataset)
        status = created_row.find_element(By.XPATH, ".//td[2]").text
        self.assertEqual("Planned", status)
        startdate = created_row.find_element(By.XPATH, ".//td[3]").text
        self.assertEqual("01‑01‑2022", startdate)

        # Part II: verify via Cell box (at the bottom). Expected only relation data to be present.
        # If any of the actual data cells shows any data, it must be an error - no data is yet filled.
        created_row.click()
        time.sleep(self.sleep_time)
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                self.driver.find_element(
                    By.XPATH,
                    '//div[@class="container-bottom"]//tbody//tr[./td[contains(text(), "Create examination.")]]',
                ),
            ),
        )

        # Now we check all cells in the created row in Cell box.
        md_row_cells = self.driver.find_elements(
            By.XPATH,
            '//div[@class="container-bottom"]//tbody//tr[./td[contains(text(), "Create examination.")]]//td',
        )
        self.assertEqual("10 yrs", md_row_cells[0].text)
        self.assertEqual("Planned", md_row_cells[1].text)
        self.assertEqual("2022-01-01", md_row_cells[2].text)
        for cell in md_row_cells[3:-1]:
            self.assertEqual("", cell.text)

        # Part III: verify via examination form. Again only relation data shall be present.
        self.action.double_click(created_row).perform()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("/data/examination/"),
        )

        all_html_row_elements = self.driver.find_elements(
            By.XPATH,
            '//div[@id="survey-form-wrapper"]//div[@class="row mb-2"]',
        )

        # First element (index 0) shall be date/status row, Last row (index -1) shall be comments row.
        startdate = (
            all_html_row_elements[0]
            .find_element(By.CSS_SELECTOR, "date-input[name=startdate]")
            .get_attribute("value")
        )
        self.assertEqual("2022-01-01", startdate)

        comments = all_html_row_elements[-1].find_element(By.XPATH, ".//textarea").text
        self.assertEqual("Create examination.", comments)

        # Now we inspect the data rows, and they shall be empty.
        for element in all_html_row_elements[1:-1]:
            data = element.find_element(By.XPATH, ".//input").get_attribute("value")
            self.assertEqual("", data)

        checkbox = self.driver.find_element(
            By.XPATH,
            '//div[@id="survey-form-wrapper"]//span//input',
        )
        self.assertFalse(checkbox.get_attribute("checked"))

        back_button = self.driver.find_element(
            By.XPATH,
            '//div[@id="survey-form-wrapper"]//div[@class="col d-flex justify-content-end"]//a',
        )
        self.driver.execute_script("arguments[0].scrollIntoView();", back_button)
        time.sleep(self.sleep_time)
        back_button.click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("proband/1111"),
        )

        # ##### Test updating Examination and Cell #####
        # Start with sorting the examinations list.
        examinations_header = self.driver.find_element(
            By.ID,
            "examinations-list",
        ).find_element(
            By.CLASS_NAME,
            "datatable-headercontainer",
        )
        sort = examinations_header.find_element(
            By.CSS_SELECTOR,
            "thead tr th:nth-child(1) button.datatable-sorter",
        )
        sort.click()
        # Select a Examination (select "Screen Time") and come in to surveys / forms page
        examinations = self.driver.find_element(
            By.CSS_SELECTOR,
            "#examinations-list .datatable-container",
        )
        self.assertIn("Screen Time", examinations.text)
        examination_row = examinations.find_element(By.TAG_NAME, "tbody").find_element(
            By.XPATH,
            './/tr[./td[text()="Screen Time"]]',
        )
        examination_row.click()
        time.sleep(self.sleep_time)

        # Save current visible data on Examination-box and Cell-box as list for latter comparison.
        old_mdv_box_data = [
            cell.text for cell in examination_row.find_elements(By.XPATH, ".//td")
        ]

        md_row_cells = self.driver.find_elements(
            By.XPATH,
            '//div[@class="container-bottom"]//tbody//tr[./td[contains(text(), "10 yrs")]]//td',
        )
        old_md_box_data = [cell.text for cell in md_row_cells]

        # Now go to examination form and update the data.
        self.action.double_click(examination_row).perform()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("/data/examination/"),
        )

        # Extra verification that it is actually Screen Time
        form_header = (
            self.driver.find_element(By.CLASS_NAME, "container")
            .find_element(By.XPATH, ".//div[1]")
            .text
        )
        self.assertIn("Screen Time", form_header)

        # Save current visible data (except the header and comments data) on form-page
        all_html_row_elements = self.driver.find_elements(
            By.CSS_SELECTOR,
            "div#survey-form-wrapper div.row.mb-2, div#survey-form-wrapper div.row.mb-3",
        )
        old_form_data = [
            element.get_attribute("value")
            for element in self.driver.find_elements(
                By.CSS_SELECTOR,
                "date-input,input,select",
            )
        ]

        # Update data in selected fields
        end_date = self.driver.find_element(
            By.CSS_SELECTOR,
            "date-input[name=finishdate]",
        )
        end_date_shadow_root = self.driver.execute_script(
            "return arguments[0].shadowRoot",
            end_date,
        )
        day_input = end_date_shadow_root.find_element(By.CSS_SELECTOR, "input#day")
        day_input.click()
        day_input.send_keys("04")
        month_input = end_date_shadow_root.find_element(
            By.CSS_SELECTOR,
            "input#month",
        )
        month_input.click()
        month_input.send_keys("12")
        year_input = end_date_shadow_root.find_element(By.CSS_SELECTOR, "input#year")
        year_input.click()
        year_input.send_keys("2019")
        turned_off_sun_thu_field = self.driver.find_element(
            By.NAME,
            "question-turned_off_sun_thu",
        )
        turned_off_sun_thu_field.clear()
        turned_off_sun_thu_field.click()
        turned_off_sun_thu_field.send_keys("21:00")

        deviceinroom_field = Select(
            self.driver.find_element(By.NAME, "question-deviceinroom"),
        )
        deviceinroom_field.select_by_visible_text("No")

        gaming_dev_fri_sun_field = Select(
            self.driver.find_element(By.NAME, "question-gaming_dev_fri_sun"),
        )
        gaming_dev_fri_sun_field.select_by_visible_text("Max 6")

        comments_field = self.driver.find_element(By.ID, "id_comments")
        comments_field.click()
        comments_field.send_keys("Update examination.")
        time.sleep(self.sleep_time)

        exceptional_values_field = self.driver.find_element(
            By.ID,
            "id_exceptional_values",
        )
        exceptional_values_field.click()

        # Save and back to front page
        submit_button = self.driver.find_element(
            By.CLASS_NAME,
            "container",
        ).find_element(
            By.CSS_SELECTOR,
            "button.submit-form",
        )
        time.sleep(self.sleep_time)
        submit_button.click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("proband/1111"),
        )

        # ##### Verify updated examination data #####
        # Part I: verify via Examination (even-list) box, here only relation data (Examination fields) can be verified.
        updated_row = self.driver.find_element(
            By.XPATH,
            '//div[@id="examinations-list"]//tbody//tr[./td[contains(text(), "Update examination.")]]',
        )
        status = updated_row.find_element(By.XPATH, ".//td[2]").text
        self.assertEqual(old_mdv_box_data[1], status)
        startdate = updated_row.find_element(By.XPATH, ".//td[3]").text
        self.assertEqual(old_mdv_box_data[2], startdate)

        # Part II: verify via Cell box (at the bottom).
        # First select the desired examination and then wait for Cell box to load.
        updated_row.click()
        time.sleep(self.sleep_time)
        WebDriverWait(self.driver, self.wait_time).until(
            EC.element_to_be_clickable(
                self.driver.find_element(
                    By.XPATH,
                    '//div[@class="container-bottom"]//tbody//tr[./td[contains(text(), "Update examination.")]]',
                ),
            ),
        )

        # Now we need to verify data in every cell.
        updated_row_cells = self.driver.find_elements(
            By.XPATH,
            '//div[@class="container-bottom"]//tbody//tr[./td[contains(text(), "Update examination.")]]//td',
        )
        updated_md_box_data = [cell.text for cell in updated_row_cells]

        # Verify unchanged data
        changed_data_indices = [5, 7, 8, 10]

        for i, d in enumerate(updated_md_box_data):
            if i in changed_data_indices:
                continue
            self.assertEqual(old_md_box_data[i], d)

        # verify changed data
        self.assertEqual("0", updated_md_box_data[8])
        self.assertEqual("Max 6", updated_md_box_data[7])
        self.assertEqual("21:00", updated_md_box_data[5])

        # Part III: verify via examination form.
        self.action.double_click(updated_row).perform()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("/data/examination/"),
        )
        # verify changed data
        updated_form_data = [
            element.get_attribute("value")
            for element in self.driver.find_elements(
                By.CSS_SELECTOR,
                "date-input,input,select",
            )
        ]
        # verify header data
        self.assertEqual("2018-12-04", updated_form_data[0])
        self.assertEqual("2019-12-04", updated_form_data[1])

        changed_data_indices = [1, 4, 5, 9]
        for i, d in enumerate(updated_form_data):
            if i in changed_data_indices:
                continue
            self.assertEqual(old_form_data[i], d)
        # verify changed actual data
        self.assertEqual("2019-12-04", updated_form_data[1])
        self.assertEqual("Max 6", updated_form_data[4])
        self.assertEqual("21:00", updated_form_data[5])
        self.assertEqual("0", updated_form_data[9])

        # verify updated comments
        comments = self.driver.find_element(By.CSS_SELECTOR, "textarea").text
        self.assertEqual("Update examination.", comments)

        # verify checkbox exceptional values
        checkbox = self.driver.find_element(
            By.XPATH,
            '//div[@id="survey-form-wrapper"]//span//input',
        )
        self.assertTrue(checkbox.get_attribute("checked"))

        back_button = self.driver.find_element(
            By.XPATH,
            '//div[@id="survey-form-wrapper"]//div[@class="col d-flex justify-content-end"]//a',
        )
        self.driver.execute_script("arguments[0].scrollIntoView();", back_button)
        time.sleep(self.sleep_time)
        back_button.click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("proband/1111"),
        )
        # ##### Test lock examination #####
        # First go in to an examination, and click the house-icon to come back - people will verify
        # the data before locking.
        examination_row = self.driver.find_element(
            By.CSS_SELECTOR,
            "#examinations-list .datatable-container tbody tr[data-name=screen_time]",
        )
        examination_row.click()
        time.sleep(self.sleep_time)
        self.action.double_click(examination_row).perform()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("/data/examination/"),
        )

        # Back to front page
        home_link = self.driver.find_element(By.CSS_SELECTOR, "#content a")
        home_link.click()
        WebDriverWait(self.driver, self.wait_time).until(EC.url_contains("localhost"))

        self.driver.find_element(By.ID, "probands").send_keys("1111\n")

        # Wait for next page to load
        WebDriverWait(self.driver, self.wait_time).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "#diagnosis tbody")),
        )
        visit_table = self.driver.find_element(
            By.CSS_SELECTOR,
            "#visits .datatable-container",
        )
        self.assertIn("10 yrs", visit_table.text)
        visit_row = visit_table.find_element(By.TAG_NAME, "tbody").find_element(
            By.XPATH,
            './/tr[./td[text()="10 yrs"]]',
        )
        visit_row.click()
        time.sleep(self.sleep_time)

        # Now lock the examination
        examination_row = self.driver.find_element(
            By.CSS_SELECTOR,
            "#examinations-list .datatable-container tbody tr[data-name=screen_time]",
        )
        self.action.context_click(examination_row).perform()
        context = self.driver.find_element(By.XPATH, "//ul//li[3]//a")
        context.click()
        examination_row.click()
        time.sleep(self.sleep_time)
        # Verify that the row in on Examination (examination-list) is marked as "locked".
        self.assertIn("locked", examination_row.get_attribute("class").split(" "))
        # # Here we just choose the first row on Cell box, our examination row is the one with latest startdate and
        # # the Cell box is default sorted by visit type and startdate.
        md_row = self.driver.find_element(
            By.XPATH,
            '//div[@id="cells-list"]//table//tbody//tr[1]',
        )
        self.assertIn("locked", md_row.get_attribute("class").split(" "))

        # Verify that all rows in examination form is not editable
        self.action.double_click(examination_row).perform()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("/data/examination/"),
        )

        all_interaction_elements = self.driver.find_elements(
            By.CSS_SELECTOR,
            "input, select, textarea, button",
        )

        for element in all_interaction_elements:
            self.assertTrue(element.get_attribute("disabled"))

        back_button = self.driver.find_element(
            By.XPATH,
            '//div[@id="survey-form-wrapper"]//div[@class="col d-flex justify-content-end"]//a',
        )
        self.driver.execute_script("arguments[0].scrollIntoView();", back_button)
        time.sleep(self.sleep_time)
        back_button.click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("proband/1111"),
        )

        # Now unlock the examination.
        examination_row = self.driver.find_element(
            By.XPATH,
            '//div[@id="examinations-list"]//tbody//tr[@data-name="screen_time"]',
        )
        self.action.context_click(examination_row).perform()
        context = self.driver.find_element(By.XPATH, "//ul//li[3]//a")
        context.click()
        examination_row.click()
        time.sleep(self.sleep_time)

        # Verify that the selected row in on Examination (examination-list) box is no longer marked as locked.
        self.assertIn("selected", examination_row.get_attribute("class").split(" "))

        # Verify that all rows in examination form is no longer disabled
        self.action.double_click(examination_row).perform()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("/data/examination/"),
        )

        all_interaction_elements = self.driver.find_elements(
            By.CSS_SELECTOR,
            "input, select, textarea, button",
        )

        for element in all_interaction_elements:
            self.assertFalse(element.get_attribute("disabled"))

        back_button = self.driver.find_element(
            By.XPATH,
            '//div[@id="survey-form-wrapper"]//div[@class="col d-flex justify-content-end"]//a',
        )
        self.driver.execute_script("arguments[0].scrollIntoView();", back_button)
        time.sleep(self.sleep_time)
        back_button.click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("proband/1111"),
        )

        # -------------------- ProbandVisit test --------------------
        # ##### Test sorting Visits #####
        visit_headers = self.driver.find_elements(
            By.XPATH,
            '//div[@id="visits"]//thead//tr//button[@class="datatable-sorter"]',
        )
        for sorter in visit_headers:
            sorter.click()

        # ##### Test create Visit #####
        self.driver.find_element(
            By.CSS_SELECTOR,
            "#visits thead a.plus-button",
        ).click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("/visit/create/1111/"),
        )

        visit_type = Select(self.driver.find_element(By.ID, "fk_visit_type"))
        visit_type.select_by_visible_text("Telephone consultation")

        status = Select(self.driver.find_element(By.ID, "id_status"))
        status.select_by_visible_text("Completed")

        visit_date = self.driver.find_element(By.ID, "id_visit_date")
        visit_date.send_keys("01.01.2022")
        visit_date.send_keys(Keys.ENTER)

        comments = self.driver.find_element(By.ID, "id_comments")
        comments.click()
        comments.send_keys("Selenium create Visit")

        submit = self.driver.find_element(By.ID, "submit")
        submit.click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("proband/1111"),
        )

        # ##### Test update Visit #####
        # Verify that the Visit row we want to update actually exists and double click.
        visit_row = self.driver.find_element(
            By.XPATH,
            '//div[@id="visits"]//tbody//tr[@data-id="73"]',
        )
        visit_row_visit = visit_row.find_element(By.XPATH, ".//td[1]").text
        visit_row_date = visit_row.find_element(By.XPATH, ".//td[4]").text
        self.assertEqual(visit_row_visit, "Asthma control")
        self.assertEqual(visit_row_date, "02‑02‑2021")
        visit_row.click()
        time.sleep(self.sleep_time)
        visit_row = self.driver.find_element(
            By.XPATH,
            '//div[@id="visits"]//tbody//tr[@data-id="73"]',
        )
        self.action.double_click(visit_row).perform()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("/visit/update/"),
        )

        # Update the Visit
        visit = Select(self.driver.find_element(By.ID, "fk_visit_type"))
        visit.select_by_visible_text("Allergy control")

        sec_visit = Select(self.driver.find_element(By.ID, "fk_secondary_visit_type"))
        sec_visit.select_by_visible_text("Telephone consultation")

        status = Select(self.driver.find_element(By.ID, "id_status"))
        status.select_by_visible_text("Completed")

        comments = self.driver.find_element(By.ID, "id_comments")
        comments.click()
        comments.send_keys("Selenium update Visit")

        submit = self.driver.find_element(By.ID, "submit")
        submit.click()
        WebDriverWait(self.driver, self.wait_time).until(
            EC.url_contains("proband/1111"),
        )
