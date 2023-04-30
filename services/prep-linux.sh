# remove any files that are not a specified os type
# usage: filter-files.sh <os-type>

# get the os type
os_type=$1

# get the current directory
dir=$(pwd)

#if DO_REMOVE is set to true, then remove the files
if [ "$DO_REMOVE" = "true" ]; then
    echo "Removing files..."
    find $dir -type d \( -name "darwin" -o -name "win32" \) -exec rm -f {} \;
    exit 0
fi

