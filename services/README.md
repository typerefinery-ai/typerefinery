# Services Distros

## Packages

### JRE
<https://adoptium.net/temurin/releases/>

### Python
<https://www.python.org/downloads/release/python-3100/>

### Python Pip

curl <https://bootstrap.pypa.io/get-pip.py> -o get-pip.py
python get-pip.py

### TypeDB
<https://github.com/vaticle/typedb/releases/latest>

## Services

All services are executed using [uvicorn](https://www.uvicorn.org/) this allows for simple and isolated service design.

Each service needs to have a `main.py` file in the root of the service directory. As well as a `requirements.txt` file.
