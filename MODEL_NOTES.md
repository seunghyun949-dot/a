# MODEL NOTES · v0.2

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
Iestimate = min(Iraw, Pin,max / VHV), or zero if VHV is zero.
This optimistic 100%-power upper bound prevents estimated output electrical power exceeding input capacity.
It does not model actual input current or losses or establish a self-consistent loaded operating point.
The app flags this bound when active. Real loaded HV and current may both be lower.
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
