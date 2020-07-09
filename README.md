## Welcome to the Bottius Discord Bot

Bottius is a simple discord Bot created out of boredom for the Bricc Cult Discord server.

### Deploying Bottius
Follow these easy steps to get your Bottius instance working <sub><sup>obviously you need to install nodejs and npm first (duh)<sup><sub>:

1. clone Bottius Repo
2. do `npm ci` in the Bottius root directory
3. add a botconfig.json in `source/` directory which should look like this:
    ````json
    {
      "token": "yourTotallySafeBotToken",
      "prefix": "!!",
      "masters": ["275355515003863040", "182896862477549577"],
      "activity": "",
      "activityStatus": ""
    }
4. compile Bottius with TypeScript `tsc`

   if you dont have TypeScript installed do `npm install -g TypeScript`
   
5. now just start the bot from Bottius root directory `node out/bot.js`


### About Migration

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

1. delete `db.db`
2. delete your migration in `source/Migration`
3. delete `out/` directory
4. compile `tsc`
5. run Bottius

And Bottius is like he was before the big migration fuckup
