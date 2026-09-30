# MODEL NOTES

## 1. 전체 흐름

DC Power Supply
→ Coil / Transformer Step-up
→ Rectifier / Capacitor Multiplier
→ HV Output
→ Corona / EHD
→ Estimated Thrust / Wind Velocity

## 2. 1차 승압

기본 권선비:

V_secondary / V_primary ≈ Ns / Np

현재 앱에서는 여기에 사용자가 조절하는 `coil efficiency`를 곱해
손실을 단순 반영합니다.

## 3. 정류 / 커패시터 승압

배전압 단수와 커패시터 용량에 따른 효과를 단순화한 경험적 gain을 사용합니다.
이는 Cockcroft-Walton 회로의 정확한 transient 해석을 대체하지 않습니다.

## 4. 코로나 개시

전극 반경과 간격을 사용한 단순 전계 기반 모델을 사용합니다.
실제 코로나 개시는 전극 곡률, 표면 거칠기, 습도, 압력, 극성 등에 따라 달라집니다.

## 5. 코로나 전류

간이 경험식:

I ∝ (V - V0)^2

형태를 사용하며 `코로나 보정계수`로 실험값에 맞출 수 있습니다.

## 6. EHD 추력

간이식:

F ≈ I d / μ

- F: 추력
- I: 코로나 전류
- d: 전극 간격
- μ: 이온 이동도

## 7. 등가 평균 풍속

간이 운동량 관계:

F ≈ 1/2 ρ A v²

에서 v를 역산합니다.

따라서 화면의 풍속은 실제 국소 제트 속도가 아니라
유효 유동 면적 전체에 대한 등가 평균 풍속으로 해석해야 합니다.

## 8. 사용 목적

- 설계 변수 민감도 비교
- 실험 조건 사전 탐색
- 팀 내 조건 공유
- 측정값과 이론값 비교
- 후속 보정 모델 개발

## 9. 권장 다음 단계

실험 데이터가 확보되면 CSV 기준으로 다음 값을 기록하세요.

- Vin
- Current limit
- Np / Ns
- Capacitance
- Multiplier stage
- Gap
- Emitter radius
- Measured HV output
- Measured corona current
- Measured wind velocity
- Measured thrust

이 데이터를 이용해 현재 보정계수를 피팅하면
단순 이론 모델에서 프로젝트 전용 반경험 모델(semi-empirical model)로 발전시킬 수 있습니다.
