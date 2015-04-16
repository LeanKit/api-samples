# LeanKit search with Node.js

This sample uses the [LeanKit Client for Node.js](https://github.com/LeanKit/leankit-node-client) to search for cards on a given board, with the option to export those cards in CSV or JSON format.

```
Usage: node search.js -h "accountname" -u "email" -p "password" -b ["name" or 1234] [options]

Options:
  -h, --host      Host name (e.g. mycompany)                [string]  [required]
  -u, --user      Account email (e.g. me@company.com)       [string]  [required]
  -p, --password  Account password                          [string]  [required]
  -b, --board-id  Board name or ID                                    [required]
  -s, --search    Search terms                                          [string]
  --board         Search board                                         [boolean]
  --backlog       Search backlog                                       [boolean]
  --archive       Search recent archive                                [boolean]
  --old           Search old archive (> 14 days)                       [boolean]
  --comments      Search comments                                      [boolean]
  --tags          Search tags                                          [boolean]
  -?, --help      Show help
```

## Running the Node.js search sample

* Install [Node.js](https://nodejs.org/)
* Download or clone this repository
* Open a command/terminal window and install the required dependencies

```
npm install
```

* Execute a search using Node.js

```
node search.js -h "mycompany" -u "me@mycompany.com" -p "mypassword" -b "my board name" --backlog > backlog.csv
```
