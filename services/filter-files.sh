# remove any files that are not a specified os type
# usage: filter-files.sh <os-type>

# get the os type
os_type=$1

# get the current directory
dir=$(pwd)

# find all folders named: darwin, linux, win32
# and remove all files that are not in the specified os type
find $dir -type d \( -name "darwin" -o -name "linux" -o -name "win32" \) -prune -o -type f -not -name "$os_type" -exec rm -f {} \;

