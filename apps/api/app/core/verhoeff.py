"""
Verhoeff algorithm implementation for Indian Aadhaar card validation.
Aadhaar uses the Verhoeff checksum algorithm (based on the dihedral group D5)
to detect all single-digit errors and all transposition errors between adjacent digits.
"""

# The multiplication table (d)
_D_TABLE = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]

# The permutation table (p)
_P_TABLE = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]

# The inverse table (inv)
_INV_TABLE = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]


def validate_verhoeff(num_str: str) -> bool:
    """
    Validates a number string using the Verhoeff algorithm.
    Returns True if valid, False otherwise.
    """
    if not num_str or not num_str.isdigit():
        return False
    c = 0
    # Process digits in reverse order
    reversed_digits = [int(ch) for ch in reversed(num_str)]
    for i, digit in enumerate(reversed_digits):
        c = _D_TABLE[c][_P_TABLE[i % 8][digit]]
    return c == 0


def compute_verhoeff_checksum(num_str: str) -> int:
    """
    Computes the Verhoeff checksum digit for an 11-digit or n-digit number.
    Returns the check digit (0-9).
    """
    c = 0
    reversed_digits = [int(ch) for ch in reversed(num_str)]
    for i, digit in enumerate(reversed_digits):
        c = _D_TABLE[c][_P_TABLE[(i + 1) % 8][digit]]
    return _INV_TABLE[c]


def generate_valid_aadhaar(prefix_11_digits: str = "36894521098") -> str:
    """
    Generates a valid 12-digit Aadhaar number with correct Verhoeff checksum.
    """
    clean_prefix = "".join(filter(str.isdigit, prefix_11_digits))[:11]
    while len(clean_prefix) < 11:
        clean_prefix += "1"
    check = compute_verhoeff_checksum(clean_prefix)
    return f"{clean_prefix}{check}"
