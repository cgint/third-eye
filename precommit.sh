#!/bin/bash

# Function to install the pre-commit hook
install_hook() {
    HOOK_DIR=".git/hooks"
    HOOK_PATH="$HOOK_DIR/pre-commit"

    # Create hooks directory if it doesn't exist
    mkdir -p "$HOOK_DIR"

    # Create the pre-commit hook
    cat > "$HOOK_PATH" << EOL
#!/bin/bash
sh $(dirname "\$0")/precommit.sh
EOL

    # Make the hook executable
    chmod +x "$HOOK_PATH"

    echo "Pre-commit hook installed successfully."
}

# Function to uninstall the pre-commit hook
uninstall_hook() {
    HOOK_PATH=".git/hooks/pre-commit"
    rm -f "$HOOK_PATH"
    echo "Pre-commit hook uninstalled successfully."
}

# Check if the script is called with 'install' parameter
if [ "$1" = "install" ]; then
    install_hook
    exit 0
fi

# Check if the script is called with 'uninstall' parameter
if [ "$1" = "uninstall" ]; then
    uninstall_hook
    exit 0
fi

get_plugin_core_name() {
    echo "$(basename "$1" | sed 's/pre_plugin_\(.*\)\.sh/\1/')"
}

# Function to run a plugin and capture its output and status
run_plugin() {
    plugin="$1"
    plugin_core_name=$(get_plugin_core_name "$plugin")
    printf " Starting plugin: %s" "$plugin_core_name" >&2
    
    # Check if plugin exists and is executable
    if [ ! -f "$plugin" ]; then
        printf "Error: Plugin file %s does not exist\n" "$plugin" >&2
        return 1
    fi
    
    if [ ! -x "$plugin" ]; then
        printf "Error: Plugin file %s is not executable\n" "$plugin" >&2
        return 1
    fi

    printf "\n" >&2

    # Create a temporary file to store the plugin result
    tmp_file=$(mktemp)
    
    # Run the plugin and capture output
    /bin/sh "$plugin" > "$tmp_file.out" 2>&1
    status=$?
    
    # Store metadata
    printf "name='%s'\n" "$plugin" > "$tmp_file"
    printf "output='%s'\n" "$(cat "$tmp_file.out")" >> "$tmp_file"
    printf "status='%s'\n" "$status" >> "$tmp_file"
    rm -f "$tmp_file.out"
    
    printf "%s\n" "$tmp_file"
}

# Function to render the output of a plugin
render_plugin_output() {
    result_file="$1"
    name=""
    output=""
    status=""
    
    # Source the temporary file to get the values
    . "$result_file"
    plugin_core_name=$(get_plugin_core_name "$name")
    printf "\n\nPlugin finished with exit code %s: %s" "$status" "$plugin_core_name"
    printf "\n=================================\n"
    printf "%s\n" "$(printf "%s" "$output" | sed 's/^/  /')"
}

# Function to generate the summary table in Markdown format
generate_summary_table() {
    echo ""
    echo "## Plugin Summary"
    echo ""
    
    # Print table header with borders
    printf "+----------------------+----------+\n"
    printf "| %-20s | %-8s |\n" "Plugin" "Status"
    printf "+----------------------+----------+\n"
    
    # Read results into array again
    while IFS= read -r result_file; do
        [ ! -f "$result_file" ] && continue
        
        # Initialize variables
        name=""
        status=""
        
        # Source the file
        . "$result_file"
        
        status_text="Success"
        if echo "$output" | grep -q "No files to lint"; then
            status_text="No files"
        fi
        [ "$status" -ne 0 ] && status_text="Failed"
        
        name_core_plugin=$(get_plugin_core_name "$name")
        printf "| %-20s | %-8s |\n" "$name_core_plugin" "$status_text"
    done < "$tmp_dir/results.txt"
    
    # Print table footer
    printf "+----------------------+----------+\n"
}

# Run checks
echo "Running checks..."

# Initialize array for plugin results
declare -a plugin_results

# Create a temporary directory for results
tmp_dir=$(mktemp -d)
trap 'rm -rf "$tmp_dir"' EXIT

# Store list of plugins in a temporary file
chmod +x *.sh
find . -maxdepth 1 -type f -name "pre_plugin_*.sh" -print0 > "$tmp_dir/plugins.txt"

echo

# Process each plugin
while IFS= read -r -d $'\0' plugin; do
    result_file=$(run_plugin "$plugin")
    echo "$result_file" >> "$tmp_dir/results.txt"
done < "$tmp_dir/plugins.txt"

# Read results into array
while IFS= read -r result_file; do
    plugin_results+=("$result_file")
done < "$tmp_dir/results.txt"

# Wait for all plugins to finish and render output
for result_file in "${plugin_results[@]}"; do
    render_plugin_output "$result_file"
done

# Generate summary table
generate_summary_table

# Check if any plugin failed
check_plugin_failures() {
    local failed=0
    local status
    for result_file in "${plugin_results[@]}"; do
        . "$result_file"
        if [ "$status" -ne 0 ]; then
            failed=1
        fi
    done
    return $failed
}

echo
if ! check_plugin_failures; then
    echo "Pre-commit checks failed."
    exit 1
fi

# Clean up any remaining temporary files
for result_file in "${plugin_results[@]}"; do
    rm -f "$result_file"
done

echo "Pre-commit checks passed successfully."
exit 0
