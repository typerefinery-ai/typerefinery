# Files Manager

## Usage

To start the server, run the following commands:

```sh
  npm i
  npm run start
```

or

```sh
  node ./libs/index.js -p 8199 -d ./data
```

These files are on disk and are managed by the Files Manager via ui `http://localhost:8199`.

## Using the API

You can access these file via api

```bash
http://localhost:8199/api/README.md
```

You can upload files via api:

```bash
curl -X POST -F upload=@README.md http://localhost:8199/api/README.md?type=UPLOAD_FILE&overwrite=true
```

You can list files via api:

```bash
curl http://localhost:8199/api/aaa/
```
