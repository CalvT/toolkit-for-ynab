(function poll() { 
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {
  
    ynabToolKit.featureOptions.budgetProgressBars = true;
    ynabToolKit.budgetProgressBars = function ()  { // Keep feature functions contained within this
    	var entityManager = ynab.YNABSharedLib.defaultInstance.entityManager;

	   	function getCalculation(subCategoryName) {
    		var crazyInternalId = "mcbc/" + ynabToolKit.parseSelectedMonth().yyyymm() + "/" + entityManager.getSubCategoryByName(subCategoryName).getEntityId();
			var calculation = entityManager.getMonthlySubCategoryBudgetCalculationById(crazyInternalId);
			return calculation;
    	}

		// Takes N colors and N-1 sorted points from (0, 1) to make color1|color2|color3 bg style.
		function generateProgressBarStyle(colors, points) {
			points.unshift(0);
			points.push(1);
			var pointsPercent = Array.from(points, (p) => p*100);
			style = "linear-gradient(to right, ";
			for (var i = 0; i < colors.length; i++) {
				style += colors[i] + " " + pointsPercent[i] + "%, ";
				style += colors[i] + " " + pointsPercent[i + 1] + "%";
				style += (i + 1 == colors.length) ? ")" : ", ";
				}
				return style;
		}

		var date = new Date();
		var monthProgress = new Date().getDate() / new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		var s = 0.005; // Current month progress indicator width

		var subCategories = $("ul.is-sub-category");
		$(subCategories).each(function () {
			$(this).addClass('goal-progress');
			
			var subCategoryName = $(this).find("li.budget-table-cell-name>div>div")[0].title;
			var calculation = getCalculation(subCategoryName);

	    	var budgeted = calculation.balance - calculation.budgetedCashOutflows - calculation.budgetedCreditOutflows;
    		var available = calculation.balance;
    		
			if (budgeted > 0) {
				var pacing = (budgeted - available) / budgeted;
				if (monthProgress > pacing) {
					this.style.background = generateProgressBarStyle(
						["#c0e2e9", "white", "#CFD5D8", "white"],
						[pacing, monthProgress - s, monthProgress]);
				}
				else {
					this.style.background = generateProgressBarStyle(
						["#c0e2e9", "#CFD5D8", "#c0e2e9", "white"],
						[monthProgress - s, monthProgress, pacing]);
				}
			}
			else {
				this.style.background = generateProgressBarStyle(
						["white", "#CFD5D8", "white"],
						[monthProgress - s, monthProgress]);
			}
		})

		var masterCategories = $("ul.is-master-category");
		$(masterCategories).each(function () {
			this.style.background = generateProgressBarStyle(
						["#E5F5F9", "#CFD5D8", "#E5F5F9"],
						[monthProgress - s, monthProgress]);
		})
     
    }; // Keep feature functions contained within this
    ynabToolKit.budgetProgressBars(); // Run once and activate setTimeOut()

  } else {
    setTimeout(poll, 250);  
  }
})();
