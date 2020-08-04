# Welcome to the Bottius Discord Bot

Bottius is a simple discord Bot created out of boredom for the Bricc Cult Discord server.

## Deploying Bottius

There are two ways of deploying Bottius. You can either use the installers or manually set everything up.

### Installer Deployment

The installer automatically installs and sets up everything required to run Bottius. To get started, simply execute the following command: `wget -N https://raw.githubusercontent.com/Montori/Bottius/master/linux-master-installer.sh && chmod +x linux-master-installer.sh && sudo bash linux-master-installer.sh`

After using this command, simply follow the "instructions" in the installer menu.

#### Officially Supported Linux Distributions

* Ubuntu
   * 18.04
   * 16.04
* Debian
   * 10
   * 9
* CentOS/RHEL
   * 8
   * 7

### Manual Deployment

Follow the steps below to manually get your Bottius instance working:

1. Clone the Bottius repo: `git clone https://github.com/Montori/Bottius`
2. Download and install PostgreSQL 12, following the instructions at:
    * Linux: <https://www.postgresql.org/download/linux/>
    * Windows: <https://www.postgresql.org/download/windows/>
3. Install Node.js at:
    * Linux: <https://github.com/nodesource/distributions/blob/master/README.md>
    * Windows: <https://nodejs.org/en/download/>
4. Install TypeScript globally: `npm install -g typescript`
5. From the Bottius root directory, install the required dependencies: `npm ci`
6. Create `botconfig.json` in the `source/` directory, and place the following configurations into the file:

    ```json
    {
      "token": "yourTotallySafeBotToken",
      "prefix": "!!",
      "masters": ["userID"],
      "activity": "",
      "activityStatus": ""
    }
    ```

    Notes:
    * You may add more than one userID to the masters, by separating each ID with a comma
    * Make sure to customize the `botconfig.json` (such as the token and masters) to your needs

7. Create `ormconfig.json` in the Bottius root directory, and place the following configuration into the file:

     ```json
    {
        "type": "postgres",
        "url": "postgres://postgres:!DB_PASS!@localhost:5432/Bottius_DB",
        "entities": ["out/Entities/Persistent/*.js"],
        "migrations": ["out/Migration/*.js"],
        "cli": {
        "migrationsDir": "source/Migration"
        }
    }
    ```

    Note:
    * Realistically, the only thing you should need to change about the configurations is `!DB_PASS!`, which is the password you will give the Bottius database user.

8. Compile Bottius with TypeScript: `tsc`
9. Configure the Bottius database: `sudo -u postgres -H sh -c "createuser -P Bottius"; sudo -u postgres -H sh -c "createdb -O Bottius Bottius_DB"`
    * When prompted to enter a password for the database user, provide the same password used when setting up `botconfig.json`
10. You are now ready to run Bottius by executing the following command in the Bottius root directory: `node out/bot.js`

## About Migration

If you want to contribute to Bottius you might encounter that you want to store a thing in the database.
In order to do that you must edit an existing type or create a new one, all types belong to source/Material/
Since we use [TypeORM](https://typeorm.io/#/) you can look up all the things there but here is a quick migration guide:

1. edit the type of your choice
2. compile `tsc`
3. in Bottius root type `typeorm migration:generate -n NameOfYourMigration`
4. tsc

And voilà your migration is done! You can find it in `source/Migration`

If something went wrong after a migration you can use `typeorm migration:revert`
If something went really wrong follow these steps:

1. drop your database (restart the postgres server if a connection is still active)
2. delete your migration in `source/Migration`
3. delete `out/` directory
4. compile `tsc`
5. run Bottius

And Bottius is like he was before the big migration fuckup
