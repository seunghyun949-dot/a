# MODEL NOTES · v0.3

## HV chain and assumptions

DC → switching / transformer → half-wave Cockcroft–Walton (CW) → estimated HV → EHD.
This is a calibrated comparison model, not SPICE or a switching circuit simulation.
The defaults are assumptions, not measurements of the user's module.

- Turns ratio r = Ns / Np; default 1:100.
- Switching/flyback coefficient Ksw = 10 (adjustable estimate, 1–20).
- Coil voltage factor αcoil = 0.65; CW voltage factor αCW = 0.70.
- These factors describe voltage, NOT power conversion efficiency.
- Capacitors: 1 nF / 20 kV × 4; one full CW stage uses two capacitors and two diodes.

## Equations

    n = capacitorCount / 2
    reference voltage = Vin × r
    Vpk = Vin × Ksw × r × αcoil
    VCW,ideal = 2 × n × Vpk
    VHV,estimate = VCW,ideal × αCW
    effective HV gain = VHV,estimate / Vin

Vpk is an equivalent symmetric AC peak (half the input voltage swing), not RMS.
An asymmetric flyback pulse is not automatically equivalent to this waveform.
Ksw absorbs unmodelled switching behavior; it does not solve inductance, duty,
frequency, saturation or regulation. DC times turns ratio alone does not describe a working transformer.
Only even capacitor counts 2–16 are offered, corresponding to 1–8 full stages.
The count rule applies to the assumed CW circuit, not arbitrary series or parallel connections.

Default: 3.7 × 10 × 100 × 0.65 = 2405 Vpk; 9620 V ideal CW; 6734 V corrected HV.
With Ksw 8: 1924 Vpk; 7696 V ideal CW; 5387.2 V corrected HV.

The old empirical capacitance-based voltage gain is removed. Without frequency and load inputs,
C cannot determine a defensible voltage sag. C changes stored energy, not the HV estimate.
Ripple, charging time, load sag, diode drop and leakage remain unmodelled.
Corrected HV is NOT a solved loaded operating voltage. Fixed αCW is only a calibration.

## Power and EHD

Pin,max = Vin × Ilimit. Zero voltage or zero current limit produces zero sustained generated HV.
This is steady state: stored residual charge on a real disconnected circuit does not disappear.
The original empirical corona onset and current law are retained:
Iraw ∝ (VHV − Vonset)² / gap, with zero current below onset.
The ceiling Pin,max / VHV is only a feasibility check, not a predicted current.
If Iraw exceeds it, corona, current, thrust, gram-force and wind are unknown (null),
displayed as 판정 보류 / 계산 불가. We do not insert the ceiling into F = I d / μ:
doing so would hold current fixed and manufacture an increasing wind curve with gap.
Zero input power remains zero output, distinct from unknown. Below the ceiling,
the original uncalibrated empirical estimates remain; passing the check does not
establish a self-consistent loaded operating point or account for conversion losses.
A loaded prediction requires measured supply/load characteristics or loaded HV/current.
CSV leaves unknown numeric fields blank and adds EHDStatus and PowerCurrentLimit_A.
The latter is a ceiling at assumed HV, never a measured or predicted output current.
F ≈ I d / μ and v ≈ sqrt(2F / (ρA)), with μ = 2e-4 and ρ = 1.204, remain comparison estimates.
The average-field arc flag is coarse; its absence does not establish safety.

## Capacitor voltage and energy

In this ideal half-wave CW convention, the first pumping capacitor holds Vpk;
other capacitors hold approximately 2Vpk at no load.

    maximum ideal capacitor stress = 2Vpk
    ideal total stored energy = 0.5 × C × [Vpk² + (capacitorCount − 1) × (2Vpk)²]

The voltage check uses ideal source peak before αCW, not final output divided by stages.
Energy is the ideal no-load sum over capacitors, not one capacitor across the entire output.
Transients, ripple, derating, tolerances and discharge behavior are not included.
Ratings do not clamp calculated voltage. A displayed value within rating is NOT a safety assessment.

## Safety and calibration

HV and residual charge present shock and arc hazards. Model input range 0–15 V does not
establish the permissible physical module input. Check actual ratings, insulation and residual charge separately.
Use measured waveform swing, loaded HV, current, frequency, duty and geometry to calibrate.
Saved snapshots, copy and CSV preserve Ksw, turns ratio, effective gain, capacitor count,
CW stages and ideal/corrected voltages. Refresh clears snapshots; CSV preserves them.

## References

- [TI: Flyback converter topology](https://www.ti.com/document-viewer/lit/html/SLVAFK6/GUID-0B3C241B-688B-44BB-847B-682F017BB8A9) — duty and turns ratio both influence conversion.
- [In Situ High-Voltage Generation with a CW Multiplier (2025)](https://academic.oup.com/ptep/article/2025/5/053H03/8128270) — ideal 2NU output and nonideal loading.
- [Spellman: Capacitor Charging and HV Power Supplies](https://www.spellmanhv.com/en/Technical-Resources/High-Voltage-Reference-Manual/AN-26-capacitor-charging-and-spellman-high-voltage-power-supplies) — CW networks and stored energy.

Ksw and voltage calibration defaults are arbitrary estimates, not specifications from these sources.

## Model-based wind exploration

The explorer reuses exactly the same calculation as the main simulator. It maximizes the displayed
equivalent average wind speed over a finite grid of Vin, gap and emitter radius. Each axis uses 13
equally spaced points rounded to the UI precision, plus the current value if inside the bounds;
duplicates are removed. There are at most 2744 combinations. Equal bounds yield a single value.
Ties prefer lower input voltage, then gap, then radius for deterministic presentation.

Area and all other parameters remain fixed: reducing area or tuning a calibration coefficient cannot
artificially win this search. Candidates without corona, with gap <= 3 × radius, capacitor-rating
exceedance, the existing arc flag, or user-entered HV/average-field limit exceedance are excluded.
Power-limited candidates are always excluded. Exclusion counts check geometry,
then power limitation, then corona, then voltage/field/rating; each is counted once.
The limits are illustrative numerical filters, not a physical safety envelope or module specifications.

The top five are comparisons, not experimental instructions. The delta is against current displayed
wind; when that baseline is power-limited the delta is unavailable (비교 불가). A negative delta is possible.
No passing candidates is a valid result. The explorer never relaxes the limits automatically.
Changes to simulator settings or search inputs invalidate prior results. Applying a result updates only
the three searched controls, and the normal save/copy/CSV workflow records the resulting configuration.
This is not deep learning, a continuous/global optimum, or a measurement at a particular distance.
Boundary optima may expose monotonic behavior of the existing empirical model, not a physical optimum.
