// Senior pets (8 years or older) are adopted for half the base fee.
method AdoptionFee(base: nat, ageYears: nat) returns (fee: nat)
  ensures ageYears >= 8 ==> fee == base / 2
  ensures ageYears < 8 ==> fee == base
  ensures fee <= base
{
  if ageYears >= 8 {
    fee := base / 2;
  } else {
    fee := base;
  }
}
