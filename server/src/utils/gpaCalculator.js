export const getGradePoint = (total) => {
    if (total >= 8.5) return 4.0;
    if (total >= 8.0) return 3.5;
    if (total >= 7.0) return 3.0;
    if (total >= 6.5) return 2.5;
    if (total >= 5.5) return 2.0;
    if (total >= 4.0) return 1.0;
    return 0;
};

export const isPassedGrade = (total) => {
    return Number(total) >= 4;
};

export const calculateGPA = (items = []) => {
    let totalCredits = 0;
    let totalGradePoints = 0;
    let passedCredits = 0;

    for (const item of items) {
        const credits = Number(item.credits || 0);
        const gradePoint = Number(item.gradePoint || 0);

        if (credits <= 0) continue;

        totalCredits += credits;
        totalGradePoints += gradePoint * credits;

        if (item.isPassed) {
            passedCredits += credits;
        }
    }

    const gpa = totalCredits > 0
        ? Number((totalGradePoints / totalCredits).toFixed(2))
        : 0;

    return {
        totalCredits,
        passedCredits,
        failedCredits: totalCredits - passedCredits,
        gpa
    };
};