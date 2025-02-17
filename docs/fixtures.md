# Working with Fixtures

Fixtures are used to provide test data and initial database content.

## Updating Test Database

The test database file is found in `base/fixtures/test_database.json.xz`. To update it:

1. Find the commit that last changed the test database:
```bash
git log -p base/fixtures/test_database.json.xz
```

2. Check out that commit:
```bash
git checkout <commit-hash>
```

3. Delete current database:
```bash
rm db.sqlite3
```

4. Run migrations up to this point:
```bash
./manage.py migrate
```

5. Load the test database:
```bash
./manage.py loaddata test_database
```

6. Return to main branch:
```bash
git checkout main
```

7. Apply remaining migrations:
```bash
./manage.py migrate
```

8. Create new fixture:
```bash
./manage.py dumpdata -o base/fixtures/test_database.json.xz --natural-foreign --natural-primary
```

9. Commit the updated fixture:
```bash
git commit -a -m "update test_database"
```

## Creating New Fixtures

For creating new fixtures for specific test cases:

1. Set up the desired database state
2. Dump the relevant data:
```bash
./manage.py dumpdata app_name.model_name -o fixture_name.json
```

## Loading Fixtures

Load fixtures using:
```bash
./manage.py loaddata fixture_name
```

Note: Loading fixtures will overwrite existing data for those models.
