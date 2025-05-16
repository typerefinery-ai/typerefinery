# Database update

## Reference Flow

This step is used to update the database structure when a new version of the app is released. New database will have a new flows that use new scripts

Copy the reference `database.json` as `database_stix.json`

Cleanup json file before commit

```
^.*"directory".*\n
```

This file `database_stix.json` will be used a source to merge into existing `database.json` file when install new version of the app.
