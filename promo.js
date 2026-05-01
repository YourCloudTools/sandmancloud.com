(function () {
    var TOTAL_HOURS_PER_MONTH = 730;
    var CALC_SELECTED = "promo-tier--calc-selected";
    var MONTHLY_VM_EUR = 200;

    function formatEur(value) {
        return new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
        }).format(value);
    }

    function tierCards() {
        return Array.prototype.slice.call(
            document.querySelectorAll(".promo-pricing .promo-tier")
        );
    }

    function pickTierElement(n, cards) {
        for (var i = 0; i < cards.length; i++) {
            var max = cards[i].dataset.vmMax;
            if (max === undefined || max === "") {
                return cards[i];
            }
            var cap = Number(max);
            if (n <= cap) {
                return cards[i];
            }
        }
        return cards[cards.length - 1];
    }

    function clearCalcHighlight(cards) {
        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.remove(CALC_SELECTED);
        }
    }

    function update() {
        var cards = tierCards();
        var countEl = document.getElementById("promo-vm-count");
        var savingsEl = document.getElementById("promo-calc-savings");
        var noteEl = document.getElementById("promo-calc-note");

        clearCalcHighlight(cards);

        if (!countEl || !savingsEl || !noteEl) {
            return;
        }

        var raw = countEl.value;
        var n = parseInt(raw, 10);
        var monthlyVm = MONTHLY_VM_EUR;

        var invalid =
            raw === "" ||
            Number.isNaN(n) ||
            n < 1 ||
            n > Number(countEl.max || 500) ||
            Number.isNaN(monthlyVm);

        if (invalid) {
            savingsEl.textContent = "\u2014";
            savingsEl.classList.remove("promo-tier-savings--negative");
            noteEl.hidden = true;
            noteEl.textContent = "";
            return;
        }

        var tierEl = pickTierElement(n, cards);
        var tierPrice = Number(tierEl.dataset.tierPrice);

        tierEl.classList.add(CALC_SELECTED);
        var hourlyPrice = monthlyVm / TOTAL_HOURS_PER_MONTH;
        var monthlyWorkingHoursPrice = hourlyPrice * 176;
        var monthlyOffHoursPrice = monthlyVm - monthlyWorkingHoursPrice;
        var rawSavings = (monthlyOffHoursPrice * n) - tierPrice;
        savingsEl.textContent = formatEur(Math.abs(rawSavings));

        if (rawSavings < 0) {
            savingsEl.classList.add("promo-tier-savings--negative");
            noteEl.hidden = false;
            noteEl.textContent =
                "For this modeled scenario the subscription cost can exceed the estimated compute savings.";
        } else {
            savingsEl.classList.remove("promo-tier-savings--negative");
            noteEl.hidden = true;
            noteEl.textContent = "";
        }
    }

    function init() {
        var y = document.getElementById("promo-footer-year");
        if (y) {
            y.textContent = String(new Date().getFullYear());
        }

        var calc = document.querySelector(".promo-savings-calc");
        if (!calc) return;

        calc.addEventListener("change", update);
        var countEl = document.getElementById("promo-vm-count");
        if (countEl) {
            countEl.addEventListener("input", update);
        }
        update();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
