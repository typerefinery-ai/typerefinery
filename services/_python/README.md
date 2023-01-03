
### build ssl

```bash
wget https://www.openssl.org/source/openssl-1.1.1s.tar.gz
tar zxf openssl-1.1.1s.tar.gz
cd openssl-1.1.1s
./config --prefix=${HOME}/Downloads/ssl111 --openssldir=${HOME}/Downloads/ssl111/ssl
make 
make install_sw
cd ..

```

### build python 3.10.0

1. Build python

```bash
wget https://www.python.org/ftp/python/3.10.9/Python-3.10.9.tgz
tar zxf Python-3.10.9.tgz
cd Python-3.10.9
LDFLAGS="${LDFLAGS} -Wl,-rpath=${HOME}/Downloads/ssl111/lib" ./configure MACOSX_DEPLOYMENT_TARGET=10.8 --prefix=${HOME}/Downloads/python310 --with-openssl=${HOME}/Downloads/ssl111 --with-openssl-rpath=auto --enable-optimizations
make altinstall
```

2. Compress libs

```bash
cd lib
find . -name "__pycache__" -exec rm -rf {} \; 
cd python3.10
zip -m -r ../python310.zip . -x "lib-dynload/*" "config-3.10-darwin/*" "site-packages/*" "plat-darwin/*"
cd ../..
```

3. Rename executables

```bash
cd bin
mv python3.10 python
mv pip3.10 pip
mv python3.10-config python-config
mv pydoc3.10 pydoc
mv idle3.10 idle
mv 2to3-3.10 2to3
cd ..
```

4. Fix scripts

```bash
cd bin
echo '#!/bin/sh
"exec" "`dirname $0`/python" "$0" "$@"
# -*- coding: utf-8 -*-' > script_header.sh

for file in 2to3 idle pip pydoc python-config; do
    sed -e '1rscript_header.sh' -e '1d' $file > $file.tmp
    mv -f $file.tmp $file
    chmod +x $file
done
rm script_header.sh
cd ..
```

5. Test

```bash
otool -L bin/python
./bin/python -V
export PYTHONHOME=$PWD
export PYTHONPATH=$PWD
./bin/python -c "print('Hello World')"
./bin/python -c "import sys; print(sys.path)"
./bin/python -c "import sys, ssl; print(\"{:s}\n{:s}\".format(sys.version, ssl.OPENSSL_VERSION))"
./bin/python -c "import ssl; print(ssl._ssl)"
./bin/python -m pip --version
./bin/pip --version
```
