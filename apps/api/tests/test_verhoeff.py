import pytest
from app.core.verhoeff import validate_verhoeff, generate_valid_aadhaar, compute_verhoeff_checksum


def test_verhoeff_checksum_generation_and_validation():
    # Generate valid Aadhaar numbers with checksum
    prefix = "23456789012"
    valid_aadhaar = generate_valid_aadhaar(prefix)
    assert len(valid_aadhaar) == 12
    assert validate_verhoeff(valid_aadhaar) is True


def test_verhoeff_rejects_single_digit_alteration():
    valid_aadhaar = generate_valid_aadhaar("98765432101")
    assert validate_verhoeff(valid_aadhaar) is True

    # Alter single digit
    last_digit = int(valid_aadhaar[-1])
    corrupted_digit = str((last_digit + 1) % 10)
    corrupted_aadhaar = valid_aadhaar[:-1] + corrupted_digit
    assert validate_verhoeff(corrupted_aadhaar) is False


def test_verhoeff_rejects_transposition():
    valid_aadhaar = generate_valid_aadhaar("55443322110")
    assert validate_verhoeff(valid_aadhaar) is True

    # Swap adjacent digits
    digits = list(valid_aadhaar)
    digits[2], digits[3] = digits[3], digits[2]
    transposed = "".join(digits)
    # If adjacent digits weren't identical, transposition must fail
    if digits[2] != digits[3]:
        assert validate_verhoeff(transposed) is False
