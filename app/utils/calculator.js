/**
 * 计算基础代谢率(BMR)
 * 使用Mifflin-St Jeor公式
 * @param {Object} userData 用户数据
 * @returns {Number} BMR值
 */
function calculateBMR(userData) {
  const { gender, weight, height, age } = userData

  // 9.99 × 體重 + 6.25 × 身高 - 4.92 × 年齡 +(166 × 性別 (男 1、女 0) - 161) = 基礎代謝率 (BMR)
  const genderFactor = gender === "男" ? 1 : 0
  return 9.99 * weight + 6.25 * height - 4.92 * age + (166 * genderFactor - 161)
}

/**
 * 计算每日总能量消耗(TDEE)
 * @param {Number} bmr 基础代谢率
 * @param {String} activityLevel 活动水平
 * @returns {Number} TDEE值
 */
function calculateTDEE(bmr, activityLevel) {
  const activityFactors = {
    久坐: 1.2,
    轻度活动: 1.375,
    中度活动: 1.55,
    高度活动: 1.725,
    极高活动: 1.9,
  }

  return Math.round(bmr * activityFactors[activityLevel])
}

/**
 * 根据目标和热量缺口调整卡路里
 * @param {Number} tdee TDEE值
 * @param {String} goal 目标
 * @param {Number} calorieDeficit 热量缺口
 * @returns {Number} 调整后的卡路里
 */
function adjustCaloriesByGoal(tdee, goal, calorieDeficit = 0) {
  switch (goal) {
    case "减脂":
      return Math.round(tdee - calorieDeficit)
    case "增肌":
      return Math.round(tdee + calorieDeficit)
    case "维持体重":
    default:
      return tdee
  }
}

/**
 * 生成碳循环计划
 * @param {Object} userData 用户数据
 * @returns {Object} 碳循环计划
 */
function generateCarbCyclePlan(userData) {
  const {
    gender,
    weight,
    height,
    age,
    activityLevel,
    highCarbDays,
    nutritionConfig,
    calculatedBMR,
    calculatedTDEE,
    dailyCalories,
    calorieDeficit,
  } = userData

  // 使用预计算的BMR和TDEE
  const bmr = calculatedBMR
  const tdee = calculatedTDEE

  // 使用用户自定义的营养素配置
  const { highCarb, lowCarb } = nutritionConfig

  // 高碳日计划
  const highCarbDayPlan = {
    calories: Math.round(
      weight * highCarb.protein * 4 + // 蛋白质热量
        weight * highCarb.carbs * 4 + // 碳水热量
        weight * highCarb.fat * 9 // 脂肪热量
    ),
    protein: {
      grams: Math.round(weight * highCarb.protein),
      calories: Math.round(weight * highCarb.protein * 4),
    },
    carbs: {
      grams: Math.round(weight * highCarb.carbs),
      calories: Math.round(weight * highCarb.carbs * 4),
    },
    fat: {
      grams: Math.round(weight * highCarb.fat),
      calories: Math.round(weight * highCarb.fat * 9),
    },
  }

  // 低碳日计划
  const lowCarbDayPlan = {
    calories: Math.round(
      weight * lowCarb.protein * 4 + // 蛋白质热量
        weight * lowCarb.carbs * 4 + // 碳水热量
        weight * lowCarb.fat * 9 // 脂肪热量
    ),
    protein: {
      grams: Math.round(weight * lowCarb.protein),
      calories: Math.round(weight * lowCarb.protein * 4),
    },
    carbs: {
      grams: Math.round(weight * lowCarb.carbs),
      calories: Math.round(weight * lowCarb.carbs * 4),
    },
    fat: {
      grams: Math.round(weight * lowCarb.fat),
      calories: Math.round(weight * lowCarb.fat * 9),
    },
  }

  // 生成一周计划
  const weekPlan = generateWeekPlan(
    highCarbDayPlan,
    lowCarbDayPlan,
    highCarbDays
  )

  // 计算过程详情
  const calculationDetails = {
    bmrFormula: `9.99 × ${weight} + 6.25 × ${height} - 4.92 × ${age} + (166 × ${
      gender === "男" ? 1 : 0
    } - 161) = ${bmr}`,
    tdeeFormula: `${bmr} × ${getActivityFactor(activityLevel)} = ${tdee}`,
    dailyCaloriesFormula: `${tdee} - ${calorieDeficit} = ${dailyCalories}`,
    highCarbFormula: `高碳日：蛋白质 ${highCarb.protein}g/kg × ${weight}kg = ${highCarbDayPlan.protein.grams}g (${highCarbDayPlan.protein.calories}千卡)，碳水 ${highCarb.carbs}g/kg × ${weight}kg = ${highCarbDayPlan.carbs.grams}g (${highCarbDayPlan.carbs.calories}千卡)，脂肪 ${highCarb.fat}g/kg × ${weight}kg = ${highCarbDayPlan.fat.grams}g (${highCarbDayPlan.fat.calories}千卡)`,
    lowCarbFormula: `低碳日：蛋白质 ${lowCarb.protein}g/kg × ${weight}kg = ${lowCarbDayPlan.protein.grams}g (${lowCarbDayPlan.protein.calories}千卡)，碳水 ${lowCarb.carbs}g/kg × ${weight}kg = ${lowCarbDayPlan.carbs.grams}g (${lowCarbDayPlan.carbs.calories}千卡)，脂肪 ${lowCarb.fat}g/kg × ${weight}kg = ${lowCarbDayPlan.fat.grams}g (${lowCarbDayPlan.fat.calories}千卡)`,
  }

  return {
    stats: {
      bmr,
      tdee,
      dailyCalories,
      calorieDeficit,
      highCarbCalories: highCarbDayPlan.calories,
      lowCarbCalories: lowCarbDayPlan.calories,
      weight,
    },
    dailyPlans: {
      highCarbDay: highCarbDayPlan,
      lowCarbDay: lowCarbDayPlan,
    },
    weekPlan,
    calculationDetails,
  }
}

/**
 * 获取活动系数的文字描述
 * @param {String} activityLevel 活动水平
 * @returns {String} 活动系数描述
 */
function getActivityFactor(activityLevel) {
  const factors = {
    久坐: "1.2 (久坐)",
    轻度活动: "1.375 (轻度活动)",
    中度活动: "1.55 (中度活动)",
    高度活动: "1.725 (高度活动)",
    极高活动: "1.9 (极高活动)",
  }
  return factors[activityLevel] || activityLevel
}

/**
 * 生成一周计划
 * @param {Object} highCarbDayPlan 高碳日计划
 * @param {Object} lowCarbDayPlan 低碳日计划
 * @param {Array} highCarbDays 高碳日数组
 * @returns {Array} 一周计划
 */
function generateWeekPlan(highCarbDayPlan, lowCarbDayPlan, highCarbDays) {
  const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
  const weekPlan = []

  // 根据用户选择的高碳日生成计划
  if (highCarbDays && highCarbDays.length === 7) {
    for (let i = 0; i < 7; i++) {
      if (highCarbDays[i]) {
        // 高碳日
        weekPlan.push({
          day: weekDays[i],
          plan: highCarbDayPlan,
          type: "高碳日",
          isTrainingDay: true,
        })
      } else {
        // 低碳日
        weekPlan.push({
          day: weekDays[i],
          plan: lowCarbDayPlan,
          type: "低碳日",
          isTrainingDay: false,
        })
      }
    }
  } else {
    // 默认模式：周一和周五为高碳日，其余为低碳日
    const defaultHighCarbDays = [true, false, false, false, true, false, false]

    for (let i = 0; i < 7; i++) {
      if (defaultHighCarbDays[i]) {
        weekPlan.push({
          day: weekDays[i],
          plan: highCarbDayPlan,
          type: "高碳日",
          isTrainingDay: true,
        })
      } else {
        weekPlan.push({
          day: weekDays[i],
          plan: lowCarbDayPlan,
          type: "低碳日",
          isTrainingDay: false,
        })
      }
    }
  }

  return weekPlan
}

module.exports = {
  calculateBMR,
  calculateTDEE,
  adjustCaloriesByGoal,
  generateCarbCyclePlan,
}
