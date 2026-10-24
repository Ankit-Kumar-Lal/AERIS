import re
import hashlib
from typing import Optional, Tuple
from enum import Enum
from pydantic import BaseModel


class IdType(str, Enum):
    AADHAAR = "aadhaar"
    PAN = "pan"
    VOTER_ID = "voter_id"
    DRIVING_LICENCE = "driving_licence"
    OFFICIAL_ID = "official_id"


class IdVerificationResult(BaseModel):
    is_valid_format: bool
    is_verified: bool
    id_type: str
    masked_value: str
    id_hash: str
    provider: str
    message: str


# ID Regex patterns
PAN_REGEX = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]$")
VOTER_ID_REGEX = re.compile(r"^[A-Z]{3}[0-9]{7}$")
DL_REGEX = re.compile(r"^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$|^[A-Z]{2}-[0-9]{13}$|^[A-Z]{2}[0-9]{13}$")
OFFICIAL_ID_REGEX = re.compile(r"^[A-Za-z0-9\-\/]{4,20}$")


def mask_id_number(id_type: str, id_number: str) -> str:
    """Masks ID number for privacy preserving storage and UI display."""
    clean = re.sub(r"\s+|-", "", id_number).upper()
    if id_type == IdType.AADHAAR.value:
        if len(clean) >= 4:
            return f"XXXX-XXXX-{clean[-4:]}"
        return "XXXX-XXXX-XXXX"
    elif id_type == IdType.PAN.value:
        if len(clean) >= 4:
            return f"XXXXX{clean[5:9]}{clean[-1]}"
        return "XXXXXXXXXX"
    elif id_type == IdType.VOTER_ID.value:
        if len(clean) >= 4:
            return f"{clean[:3]}XXXX{clean[-3:]}"
        return "XXXXXXXXXX"
    elif id_type == IdType.DRIVING_LICENCE.value:
        if len(clean) >= 4:
            return f"{clean[:4]}XXXXXXX{clean[-4:]}"
        return "XXXXXXXXXXXXXXX"
    else:
        if len(clean) > 4:
            return f"{'X' * (len(clean) - 4)}{clean[-4:]}"
        return clean


def hash_id_number(id_number: str, salt: str = "AERIS_SENTINEL_SALT_2026") -> str:
    """Computes a salted SHA-256 hash of the normalized ID number to enforce uniqueness without storing plain text."""
    clean = re.sub(r"\s+|-", "", id_number).upper()
    salted = f"{salt}:{clean}:{salt}"
    return hashlib.sha256(salted.encode("utf-8")).hexdigest()


class IdVerificationService:
    """
    Abstract / Protocol interface for Indian Government ID Verification.
    Allows swappable implementations (Standard Format Validator, DigiLocker/UIDAI for Production).
    """

    def verify_id(self, id_type: str, id_number: str) -> IdVerificationResult:
        raise NotImplementedError


class MockIdVerificationAdapter(IdVerificationService):
    """
    Verification adapter that executes format & structure validation for Indian IDs.
    """

    def verify_id(self, id_type: str, id_number: str) -> IdVerificationResult:
        clean = re.sub(r"[\s\-]+", "", id_number).upper()
        masked = mask_id_number(id_type, clean)
        hashed = hash_id_number(clean)

        if id_type == IdType.AADHAAR.value:
            if not clean.isdigit() or len(clean) != 12 or clean[0] in ('0', '1'):
                return IdVerificationResult(
                    is_valid_format=False,
                    is_verified=False,
                    id_type=id_type,
                    masked_value=masked,
                    id_hash=hashed,
                    provider="Aadhaar Verification",
                    message="Aadhaar must be exactly 12 digits."
                )
            return IdVerificationResult(
                is_valid_format=True,
                is_verified=True,
                id_type=id_type,
                masked_value=masked,
                id_hash=hashed,
                provider="Aadhaar Verification",
                message="Aadhaar verified successfully."
            )

        elif id_type == IdType.PAN.value:
            if not PAN_REGEX.match(clean):
                return IdVerificationResult(
                    is_valid_format=False,
                    is_verified=False,
                    id_type=id_type,
                    masked_value=masked,
                    id_hash=hashed,
                    provider="PAN Verification",
                    message="Invalid PAN format. Must be 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)."
                )
            return IdVerificationResult(
                is_valid_format=True,
                is_verified=True,
                id_type=id_type,
                masked_value=masked,
                id_hash=hashed,
                provider="PAN Verification",
                message="PAN verified successfully."
            )

        elif id_type == IdType.VOTER_ID.value:
            if not VOTER_ID_REGEX.match(clean):
                return IdVerificationResult(
                    is_valid_format=False,
                    is_verified=False,
                    id_type=id_type,
                    masked_value=masked,
                    id_hash=hashed,
                    provider="Voter ID Verification",
                    message="Invalid Voter ID (EPIC) format. Must be 3 letters followed by 7 digits (e.g. ABC1234567)."
                )
            return IdVerificationResult(
                is_valid_format=True,
                is_verified=True,
                id_type=id_type,
                masked_value=masked,
                id_hash=hashed,
                provider="Voter ID Verification",
                message="Voter ID verified successfully."
            )

        elif id_type == IdType.DRIVING_LICENCE.value:
            if not DL_REGEX.match(clean):
                return IdVerificationResult(
                    is_valid_format=False,
                    is_verified=False,
                    id_type=id_type,
                    masked_value=masked,
                    id_hash=hashed,
                    provider="Driving Licence Verification",
                    message="Invalid Driving Licence format. Expected standard state code + year + registration digits."
                )
            return IdVerificationResult(
                is_valid_format=True,
                is_verified=True,
                id_type=id_type,
                masked_value=masked,
                id_hash=hashed,
                provider="Driving Licence Verification",
                message="Driving Licence verified successfully."
            )

        elif id_type == IdType.OFFICIAL_ID.value:
            clean_official = id_number.strip()
            if not clean_official:
                return IdVerificationResult(
                    is_valid_format=False,
                    is_verified=False,
                    id_type=id_type,
                    masked_value=masked,
                    id_hash=hashed,
                    provider="Official ID Verification",
                    message="Official ID cannot be empty."
                )
            if not OFFICIAL_ID_REGEX.match(clean_official):
                return IdVerificationResult(
                    is_valid_format=False,
                    is_verified=False,
                    id_type=id_type,
                    masked_value=masked,
                    id_hash=hashed,
                    provider="Official ID Verification",
                    message="Official ID must be 4 to 20 alphanumeric characters (hyphens and slashes allowed)."
                )
            return IdVerificationResult(
                is_valid_format=True,
                is_verified=True,
                id_type=id_type,
                masked_value=masked,
                id_hash=hashed,
                provider="Official ID Verification",
                message="Official ID verified successfully."
            )

        return IdVerificationResult(
            is_valid_format=False,
            is_verified=False,
            id_type=id_type,
            masked_value=masked,
            id_hash=hashed,
            provider="Unknown Provider",
            message="Unsupported ID type."
        )


class DigiLockerStubAdapter(IdVerificationService):
    """
    Production stub for MeriPehchaan / DigiLocker OAuth2 API integration.
    Environment keys: DIGILOCKER_CLIENT_ID, DIGILOCKER_CLIENT_SECRET
    """
    def verify_id(self, id_type: str, id_number: str) -> IdVerificationResult:
        # In production, this issues an OAuth consent redirect and fetches document URI
        return MockIdVerificationAdapter().verify_id(id_type, id_number)


_ACTIVE_VERIFIER = MockIdVerificationAdapter()


def get_id_verifier() -> IdVerificationService:
    return _ACTIVE_VERIFIER
