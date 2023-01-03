
#Replace first line in files `2to3,idle,pip,pydoc,python-config` with content of `script_header.sh`
for file in 2to3 idle pip pydoc python-config; do
    sed -i "1s|.*|$(cat script_header.sh)|" $out/bin/$file
done
