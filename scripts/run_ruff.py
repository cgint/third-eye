import subprocess
import sys
from pathlib import Path

def run_ruff(fix=False):
    # Get the project root directory (where pyproject.toml is located)
    project_root = Path(__file__).parent.parent
    src_path = str(project_root / "src")
    
    # Base command for running Ruff
    check_command = ["ruff", "check", src_path]
    
    def run_check(cmd):
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        print(result.stdout)
        return result

    if not fix:
        # Simple check mode
        result = run_check(check_command)
        sys.exit(result.returncode)
    else:
        # Fix mode: check -> fix -> check again
        if run_check(check_command).returncode != 0:
            run_check(check_command + ["--fix"])
            final_result = run_check(check_command)
            sys.exit(final_result.returncode)
        else:
            print("No issues found, skipping fix.")

def lint():
    run_ruff(fix=False)

def lintfix():
    run_ruff(fix=True)

if __name__ == "__main__":
    lint()
