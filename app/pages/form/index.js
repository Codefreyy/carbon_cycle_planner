const calculator = require("../../utils/calculator")

Page({
  data: {
    gender: "女",
    age: 28,
    height: 166,
    weight: 63,
    bodyFat: "",
    activityLevel: "中度活动",
    calorieDeficit: 500,
    highCarbDays: [true, false, false, false, true, false, false],
    activeTab: "high",
    showCalculationResult: false,
    calculatedBMR: 0,
    calculatedTDEE: 0,
    dailyCalories: 0,

    // Tooltip 相关
    showTooltip: false,
    tooltipType: "",
    tooltipTitle: "",

    // 活动系数
    activityFactors: {
      久坐: "1.2",
      轻度活动: "1.375",
      中度活动: "1.55",
      高度活动: "1.725",
      极高活动: "1.9",
    },

    // 高碳日营养素配置 (g/kg体重)
    highCarbProtein: 2.2,
    highCarbCarbs: 4,
    highCarbFat: 0,
    highCarbProteinCalories: 0,
    highCarbCarbsCalories: 0,
    highCarbFatCalories: 0,
    highCarbProteinPercentage: 0,
    highCarbCarbsPercentage: 0,
    highCarbFatPercentage: 0,
    highCarbTotalCalories: 0,
    highCarbNutrientExceeded: false,

    // 低碳日营养素配置 (g/kg体重)
    lowCarbProtein: 2.2,
    lowCarbCarbs: 2,
    lowCarbFat: 0,
    lowCarbProteinCalories: 0,
    lowCarbCarbsCalories: 0,
    lowCarbFatCalories: 0,
    lowCarbProteinPercentage: 0,
    lowCarbCarbsPercentage: 0,
    lowCarbFatPercentage: 0,
    lowCarbTotalCalories: 0,
    lowCarbNutrientExceeded: false,

    // 碳水循环模式
    lowCarbDaysCount: 3,
    highCarbDaysCount: 1,
    cyclePattern: ["L", "L", "L", "H"],

    // 日历相关
    today: "",
    startDate: "",
    weekDays: ["日", "一", "二", "三", "四", "五", "六"],
    calendarDays: [],
  },

  onLoad() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const todayStr = `${year}-${month}-${day}`

    this.setData({
      today: todayStr,
      startDate: todayStr,
    })

    this.updateCyclePattern()

    this.updateCalendar()
  },

  onGenderChange(e) {
    this.setData({
      gender: e.detail.value,
    })
  },

  onAgeChange(e) {
    const age = parseInt(e.detail.value)
    if (age >= 18 && age <= 80) {
      this.setData({
        age: age,
      })
    }
  },

  onHeightChange(e) {
    console.log(e.detail.value)
    const height = parseFloat(e.detail.value)
    if (height > 0) {
      this.setData({
        height: height,
      })
    }
  },

  onWeightChange(e) {
    const weight = parseFloat(e.detail.value)
    if (weight > 0) {
      this.setData({
        weight: weight,
      })
    }
  },

  onBodyFatChange(e) {
    const bodyFat = parseFloat(e.detail.value)
    if (!e.detail.value) {
      this.setData({
        bodyFat: "",
      })
      return
    }
    if (bodyFat > 0) {
      this.setData({
        bodyFat: bodyFat,
      })
    }
  },

  onActivityLevelChange(e) {
    this.setData({
      activityLevel: e.detail.value,
    })
  },

  onGoalChange(e) {
    const goal = e.detail.value
    let calorieDeficit = this.data.calorieDeficit

    if (goal === "减脂" && calorieDeficit < 200) {
      calorieDeficit = 500
    } else if (goal === "增肌" && calorieDeficit > 500) {
      calorieDeficit = 300
    } else if (goal === "维持体重") {
      calorieDeficit = 0
    }

    this.setData({
      goal: goal,
      calorieDeficit: calorieDeficit,
    })
  },

  onCalorieDeficitChange(e) {
    const deficit = parseFloat(e.detail.value)
    this.setData({
      calorieDeficit: deficit,
    })

    // 重新计算每日可摄入热量
    const dailyCalories = this.data.calculatedTDEE - deficit
    this.setData({
      dailyCalories: Math.round(dailyCalories),
    })

    // 重新计算营养素分配
    this.calculateHighCarbNutrition()
    this.calculateLowCarbNutrition()
  },

  onCalorieSliderChange(e) {
    this.setData({
      calorieDeficit: e.detail.value,
    })
  },

  onTrainingTypeChange(e) {
    this.setData({
      trainingType: e.detail.value,
    })

    this.setDefaultHighCarbDays()
  },

  setDefaultHighCarbDays() {
    let highCarbDays = [...this.data.highCarbDays]

    highCarbDays = [true, false, false, false, true, false, false]

    this.setData({
      highCarbDays: highCarbDays,
    })
  },

  toggleHighCarbDay(e) {
    const dayIndex = parseInt(e.currentTarget.dataset.day)
    const highCarbDays = [...this.data.highCarbDays]
    highCarbDays[dayIndex] = !highCarbDays[dayIndex]

    this.setData({
      highCarbDays: highCarbDays,
    })
  },

  validateForm() {
    const { age, height, weight, highCarbDays } = this.data

    if (!age || age < 18 || age > 80) {
      wx.showToast({
        title: "请输入有效的年龄(18-80岁)",
        icon: "none",
      })
      return false
    }

    if (!height || height <= 0) {
      wx.showToast({
        title: "请输入有效的身高",
        icon: "none",
      })
      return false
    }

    if (!weight || weight <= 0) {
      wx.showToast({
        title: "请输入有效的体重",
        icon: "none",
      })
      return false
    }

    if (highCarbDays.filter((day) => day).length === 0) {
      wx.showToast({
        title: "请至少选择一个高碳日",
        icon: "none",
      })
      return false
    }

    return true
  },

  generatePlan() {
    // 验证表单
    if (!this.validateForm()) {
      return
    }

    // 如果还没有计算营养需求，先计算
    if (!this.data.showCalculationResult) {
      this.calculateNutrition()
    }

    // 构建用户数据
    const userData = {
      gender: this.data.gender,
      weight: this.data.weight,
      height: this.data.height,
      age: this.data.age,
      activityLevel: this.data.activityLevel,
      activityFactors: this.data.activityFactors,
      calorieDeficit: this.data.calorieDeficit,
      calculatedBMR: this.data.calculatedBMR,
      calculatedTDEE: this.data.calculatedTDEE,
      dailyCalories: this.data.dailyCalories,

      // 循环模式数据
      cyclePattern: this.data.cyclePattern,
      startDate: this.data.startDate,
      lowCarbDaysCount: this.data.lowCarbDaysCount,
      highCarbDaysCount: this.data.highCarbDaysCount,

      // 高碳日营养素数据
      highCarbProtein: this.data.highCarbProtein,
      highCarbCarbs: this.data.highCarbCarbs,
      highCarbFat: this.data.highCarbFat,
      highCarbProteinCalories: this.data.highCarbProteinCalories,
      highCarbCarbsCalories: this.data.highCarbCarbsCalories,
      highCarbFatCalories: this.data.highCarbFatCalories,
      highCarbTotalCalories: this.data.highCarbTotalCalories,

      // 低碳日营养素数据
      lowCarbProtein: this.data.lowCarbProtein,
      lowCarbCarbs: this.data.lowCarbCarbs,
      lowCarbFat: this.data.lowCarbFat,
      lowCarbProteinCalories: this.data.lowCarbProteinCalories,
      lowCarbCarbsCalories: this.data.lowCarbCarbsCalories,
      lowCarbFatCalories: this.data.lowCarbFatCalories,
      lowCarbTotalCalories: this.data.lowCarbTotalCalories,
    }

    console.log("生成计划数据:", userData)

    // 跳转到结果页面
    wx.navigateTo({
      url: "/pages/result/index",
      success: (res) => {
        // 通过eventChannel向结果页面传送数据
        res.eventChannel.emit("acceptPlanData", userData)
      },
    })
  },

  // 切换高碳日/低碳日标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      activeTab: tab,
    })
  },

  // 高碳日营养素输入处理
  onHighCarbProteinChange(e) {
    const value = parseFloat(e.detail.value)
    if (value > 0) {
      this.setData({
        highCarbProtein: value,
      })
      this.calculateHighCarbNutrition()
    }
  },

  onHighCarbCarbsChange(e) {
    const value = parseFloat(e.detail.value)
    if (value > 0) {
      this.setData({
        highCarbCarbs: value,
      })
      this.calculateHighCarbNutrition()
    }
  },

  onHighCarbFatChange(e) {
    const value = parseFloat(e.detail.value)
    if (value > 0 && value <= 3) {
      this.setData({
        highCarbFat: value,
      })
    }
  },

  // 低碳日营养素输入处理
  onLowCarbProteinChange(e) {
    const value = parseFloat(e.detail.value)
    if (value > 0) {
      this.setData({
        lowCarbProtein: value,
      })
      this.calculateLowCarbNutrition()
    }
  },

  onLowCarbCarbsChange(e) {
    const value = parseFloat(e.detail.value)
    if (value > 0) {
      this.setData({
        lowCarbCarbs: value,
      })
      this.calculateLowCarbNutrition()
    }
  },

  onLowCarbFatChange(e) {
    const value = parseFloat(e.detail.value)
    if (value > 0 && value <= 3) {
      this.setData({
        lowCarbFat: value,
      })
    }
  },

  // 计算营养需求
  calculateNutrition() {
    const { gender, weight, height, age, activityLevel } = this.data

    // 验证必填项
    if (!this.validateBasicInfo()) {
      return
    }

    // 计算BMR
    const genderFactor = gender === "男" ? 1 : 0
    const bmr =
      9.99 * weight + 6.25 * height - 4.92 * age + (166 * genderFactor - 161)

    // 计算TDEE
    const activityFactors = {
      久坐: 1.2,
      轻度活动: 1.375,
      中度活动: 1.55,
      高度活动: 1.725,
      极高活动: 1.9,
    }
    const tdee = bmr * activityFactors[activityLevel]

    // 计算每日可摄入热量
    const dailyCalories = tdee - this.data.calorieDeficit

    this.setData({
      calculatedBMR: Math.round(bmr),
      calculatedTDEE: Math.round(tdee),
      dailyCalories: Math.round(dailyCalories),
      showCalculationResult: true,
    })

    // 计算营养素分配
    this.calculateHighCarbNutrition()
    this.calculateLowCarbNutrition()
  },

  // 计算高碳日营养素分配
  calculateHighCarbNutrition() {
    const { weight, dailyCalories, highCarbProtein, highCarbCarbs } = this.data

    // 计算蛋白质和碳水的热量
    const proteinCalories = weight * highCarbProtein * 4
    const carbsCalories = weight * highCarbCarbs * 4

    // 检查蛋白质和碳水热量是否超过每日总热量
    const totalProteinCarbsCalories = proteinCalories + carbsCalories
    const isExceeded = totalProteinCarbsCalories > dailyCalories

    // 剩余热量分配给脂肪
    const fatCalories = dailyCalories - proteinCalories - carbsCalories
    const fatGramsPerKg = fatCalories > 0 ? fatCalories / (9 * weight) : 0

    // 计算各营养素的百分比
    const totalPercentage = (calories) =>
      Math.round((calories / dailyCalories) * 100)

    // 更新数据，确保总热量固定为 dailyCalories
    this.setData({
      highCarbProteinCalories: Math.round(proteinCalories),
      highCarbCarbsCalories: Math.round(carbsCalories),
      highCarbFatCalories: Math.round(fatCalories),
      highCarbProteinPercentage: totalPercentage(proteinCalories),
      highCarbCarbsPercentage: totalPercentage(carbsCalories),
      highCarbFatPercentage:
        100 - totalPercentage(proteinCalories) - totalPercentage(carbsCalories),
      highCarbTotalCalories: dailyCalories,
      highCarbFat: fatGramsPerKg.toFixed(1),
      highCarbNutrientExceeded: isExceeded,
    })
  },

  // 计算低碳日营养素分配
  calculateLowCarbNutrition() {
    const { weight, dailyCalories, lowCarbProtein, lowCarbCarbs } = this.data

    // 计算蛋白质和碳水的热量（单位：大卡）
    const proteinCalories = weight * lowCarbProtein * 4
    const carbsCalories = weight * lowCarbCarbs * 4

    // 检查蛋白质和碳水热量是否超过每日总热量
    const totalProteinCarbsCalories = proteinCalories + carbsCalories
    const isExceeded = totalProteinCarbsCalories > dailyCalories

    // 直接确定脂肪热量，使得总热量固定为 dailyCalories
    const fatCalories = dailyCalories - proteinCalories - carbsCalories

    // 计算脂肪克数（以每公斤体重为单位）
    const fatGramsPerKg = fatCalories > 0 ? fatCalories / (9 * weight) : 0

    // 计算各营养素的百分比（四舍五入）
    const proteinPercentage = Math.round(
      (proteinCalories / dailyCalories) * 100
    )
    const carbsPercentage = Math.round((carbsCalories / dailyCalories) * 100)
    const fatPercentage = Math.round((fatCalories / dailyCalories) * 100)

    // 更新数据：确保 lowCarbTotalCalories 固定等于 dailyCalories
    this.setData({
      lowCarbFat: fatGramsPerKg.toFixed(1),
      lowCarbProteinCalories: Math.round(proteinCalories),
      lowCarbCarbsCalories: Math.round(carbsCalories),
      lowCarbFatCalories: Math.round(fatCalories),
      lowCarbProteinPercentage: proteinPercentage,
      lowCarbCarbsPercentage: carbsPercentage,
      lowCarbFatPercentage: fatPercentage,
      lowCarbTotalCalories: dailyCalories,
      lowCarbNutrientExceeded: isExceeded,
    })
  },

  // 验证基本信息
  validateBasicInfo() {
    const { age, height, weight } = this.data

    if (!age || age < 18 || age > 80) {
      wx.showToast({
        title: "请输入有效的年龄(18-80岁)",
        icon: "none",
      })
      return false
    }

    if (!height || height <= 0) {
      wx.showToast({
        title: "请输入有效的身高",
        icon: "none",
      })
      return false
    }

    if (!weight || weight <= 0) {
      wx.showToast({
        title: "请输入有效的体重",
        icon: "none",
      })
      return false
    }

    return true
  },

  // 低碳日数量变化
  onLowCarbDaysCountChange(e) {
    const count = parseInt(e.detail.value)
    if (count > 0) {
      this.setData({
        lowCarbDaysCount: count,
      })
      this.updateCyclePattern()
      this.updateCalendar()
    }
  },

  // 高碳日数量变化
  onHighCarbDaysCountChange(e) {
    const count = parseInt(e.detail.value)
    if (count > 0) {
      this.setData({
        highCarbDaysCount: count,
      })
      this.updateCyclePattern()
      this.updateCalendar()
    }
  },

  // 更新循环模式
  updateCyclePattern() {
    const { lowCarbDaysCount, highCarbDaysCount } = this.data
    const pattern = []

    // 先添加低碳日
    for (let i = 0; i < lowCarbDaysCount; i++) {
      pattern.push("L")
    }

    // 再添加高碳日
    for (let i = 0; i < highCarbDaysCount; i++) {
      pattern.push("H")
    }

    this.setData({
      cyclePattern: pattern,
    })
  },

  // 开始日期变化
  onStartDateChange(e) {
    this.setData({
      startDate: e.detail.value,
    })
    this.updateCalendar()
  },

  // 更新日历
  updateCalendar() {
    const { startDate, cyclePattern } = this.data
    if (!startDate || !cyclePattern.length) return

    const today = new Date()
    const startDateObj = new Date(startDate)

    // 获取当月的第一天和最后一天
    const firstDayOfMonth = new Date(
      startDateObj.getFullYear(),
      startDateObj.getMonth(),
      1
    )
    const lastDayOfMonth = new Date(
      startDateObj.getFullYear(),
      startDateObj.getMonth() + 1,
      0
    )

    // 获取当月第一天是星期几（0-6，0表示星期日）
    const firstDayWeekday = firstDayOfMonth.getDay()

    // 获取当月的总天数
    const daysInMonth = lastDayOfMonth.getDate()

    // 生成日历数据
    const calendarDays = []

    // 添加上个月的剩余天数（空白格子）
    for (let i = 0; i < firstDayWeekday; i++) {
      calendarDays.push({
        day: "",
        type: "empty",
      })
    }

    // 添加当月的天数
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(
        startDateObj.getFullYear(),
        startDateObj.getMonth(),
        i
      )
      const dateStr = this.formatDate(currentDate)

      // 判断是否是今天
      const isToday = this.isSameDay(currentDate, today)

      // 判断是否是开始日期
      const isStart = this.isSameDay(currentDate, startDateObj)

      // 判断当前日期是高碳日还是低碳日
      const dayType = this.getDayType(currentDate, startDateObj, cyclePattern)

      calendarDays.push({
        day: i,
        date: dateStr,
        type: dayType,
        isToday,
        isStart,
      })
    }

    this.setData({
      calendarDays,
    })
  },

  // 格式化日期为 YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  },

  // 判断两个日期是否是同一天
  isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  },

  // 获取某一天的类型（高碳日或低碳日）
  getDayType(date, startDate, cyclePattern) {
    function setToMidnight(date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    }
    if (setToMidnight(date).getTime() < setToMidnight(startDate).getTime()) {
      return "empty"
    }

    // 计算从开始日期到当前日期的天数差
    const diffTime = Math.abs(date - startDate)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1

    // 根据循环模式确定当前日期是高碳日还是低碳日
    const cycleLength = cyclePattern.length
    const patternIndex = diffDays % cycleLength

    return cyclePattern[patternIndex] === "H" ? "high-carb" : "low-carb"
  },

  // 分享给朋友
  onShareAppMessage: function () {
    return {
      title: "碳循环刷脂计划 - 定制你的专属减脂方案",
      path: "/pages/welcome/index",
      imageUrl: "/images/share.png", // 如果有分享图片的话
    }
  },

  // 分享到朋友圈
  onShareTimeline: function () {
    return {
      title: "碳循环刷脂计划 - 定制你的专属减脂方案",
      query: "",
      imageUrl: "/images/share.png", // 如果有分享图片的话
    }
  },

  // Tooltip 相关方法
  showProteinTooltip() {
    this.setData({
      showTooltip: true,
      tooltipType: "protein",
      tooltipTitle: "蛋白质摄入建议",
    })
  },

  showCarbsTooltip() {
    this.setData({
      showTooltip: true,
      tooltipType: "carbs",
      tooltipTitle: "碳水化合物摄入建议",
    })
  },

  hideTooltip() {
    this.setData({
      showTooltip: false,
    })
  },
})
