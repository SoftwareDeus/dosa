export enum SexEnum {
    Female = 'female',
    Male = 'male',
    Diverse = 'diverse',
    PreferNotToSay = 'prefer_not_to_say'
}

export enum DietTypeEnum {
    Healthy = 'healthy',
    Balanced = 'balanced',
    Average = 'average',
    Unhealthy = 'unhealthy'
}

export enum WaterIntakeEnum {
    Low = 'low',
    Moderate = 'moderate',
    High = 'high'
}

export enum ActivityLevelEnum {
    Sedentary = 'sedentary',
    Light = 'light',
    Moderate = 'moderate',
    Active = 'active',
    VeryActive = 'very_active'
}

export enum BloodTypeEnum {
    APos = 'A+',
    ANeg = 'A-',
    BPos = 'B+',
    BNeg = 'B-',
    ABPos = 'AB+',
    ABNeg = 'AB-',
    ZeroPos = '0+',
    ZeroNeg = '0-'
}

export type Sex = `${SexEnum}`;
export type DietType = `${DietTypeEnum}`;
export type WaterIntake = `${WaterIntakeEnum}`;
export type ActivityLevel = `${ActivityLevelEnum}`;
export type BloodType = `${BloodTypeEnum}`;

export interface HealthProfile {
    heightCm?: number;
    ageYears?: number;
    sex?: Sex;
    weightKg?: number;
    dietType?: DietType;
    waterIntake?: WaterIntake;
    allergies?: string;
    medications?: string;
    chronicConditions?: string;
    bloodType?: BloodType;
    activityLevel?: ActivityLevel;
    updatedAt?: string;
}

export type HealthProfilePartial = Partial<HealthProfile>;

export interface HealthProfileRow {
    user_id: string;
    height_cm: number | null;
    age_years: number | null;
    sex: Sex | null;
    weight_kg: number | null;
    diet_type: DietType | null;
    water_intake: WaterIntake | null;
    allergies: string | null;
    medications: string | null;
    chronic_conditions: string | null;
    blood_type: BloodType | null;
    activity_level: ActivityLevel | null;
    updated_at: string | null;
}

export const ALLOWED_SEX: ReadonlyArray<Sex> = Object.values(SexEnum);
export const ALLOWED_DIET: ReadonlyArray<DietType> = Object.values(DietTypeEnum);
export const ALLOWED_WATER: ReadonlyArray<WaterIntake> = Object.values(WaterIntakeEnum);
export const ALLOWED_ACTIVITY: ReadonlyArray<ActivityLevel> = Object.values(ActivityLevelEnum);
export const ALLOWED_BLOOD: ReadonlyArray<BloodType> = Object.values(BloodTypeEnum);

export const SEX_OPTIONS = ALLOWED_SEX.map((v) => ({ value: v }));
export const DIET_OPTIONS = ALLOWED_DIET.map((v) => ({ value: v }));
export const WATER_OPTIONS = ALLOWED_WATER.map((v) => ({ value: v }));
export const ACTIVITY_OPTIONS = ALLOWED_ACTIVITY.map((v) => ({ value: v }));
export const BLOOD_OPTIONS = ALLOWED_BLOOD.map((v) => ({ value: v }));

export function fromRow(row: HealthProfileRow | null): HealthProfile {
    if (!row) return {};
    return {
        heightCm: row.height_cm ?? undefined,
        ageYears: row.age_years ?? undefined,
        sex: row.sex ?? undefined,
        weightKg: row.weight_kg ?? undefined,
        dietType: row.diet_type ?? undefined,
        waterIntake: row.water_intake ?? undefined,
        allergies: row.allergies ?? undefined,
        medications: row.medications ?? undefined,
        chronicConditions: row.chronic_conditions ?? undefined,
        bloodType: row.blood_type ?? undefined,
        activityLevel: row.activity_level ?? undefined,
        updatedAt: row.updated_at ?? undefined
    };
}

export function toRow(userId: string, data: HealthProfilePartial): Record<string, unknown> {
    const updates: Record<string, unknown> = { user_id: userId, updated_at: new Date().toISOString() };

    const parseNum = (v: unknown) => {
        const n = Number(String(v ?? '').replace(',', '.'));
        return Number.isFinite(n) && n > 0 ? n : null;
    };

    if (data.heightCm !== undefined) {
        const hv = parseNum(data.heightCm);
        if (hv !== null) updates.height_cm = hv < 3 ? Math.round(hv * 100) : Math.round(hv);
    }
    if (data.ageYears !== undefined) {
        const av = parseNum(data.ageYears);
        if (av !== null) updates.age_years = av;
    }
    if (data.weightKg !== undefined) {
        const wv = parseNum(data.weightKg);
        if (wv !== null) updates.weight_kg = wv;
    }

    if (data.sex && (ALLOWED_SEX as ReadonlyArray<string>).includes(data.sex)) updates.sex = data.sex;
    if (data.dietType && (ALLOWED_DIET as ReadonlyArray<string>).includes(data.dietType)) updates.diet_type = data.dietType;
    if (data.waterIntake && (ALLOWED_WATER as ReadonlyArray<string>).includes(data.waterIntake)) updates.water_intake = data.waterIntake;
    if (data.activityLevel && (ALLOWED_ACTIVITY as ReadonlyArray<string>).includes(data.activityLevel)) updates.activity_level = data.activityLevel;
    if (data.bloodType && (ALLOWED_BLOOD as ReadonlyArray<string>).includes(data.bloodType)) updates.blood_type = data.bloodType;

    if (typeof data.allergies === 'string' && data.allergies.trim() !== '') updates.allergies = data.allergies;
    if (typeof data.medications === 'string' && data.medications.trim() !== '') updates.medications = data.medications;
    if (typeof data.chronicConditions === 'string' && data.chronicConditions.trim() !== '') updates.chronic_conditions = data.chronicConditions;

    return updates;
}


