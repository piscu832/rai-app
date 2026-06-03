document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const monthSelect = document.getElementById('month');
    const categorySelect = document.getElementById('category');
    const seniorityInput = document.getElementById('seniority');
    const premioInput = document.getElementById('premio');
    const totalExtrasInput = document.getElementById('totalExtras');
    const specialJobsInput = document.getElementById('specialJobs');
    const vacationDaysInput = document.getElementById('vacationDays');
    const vacationGroup = document.getElementById('vacation-group');
    
    const workingDaysSpan = document.getElementById('working-days');
    const netSalaryDiv = document.getElementById('net-salary');
    const grossValueSpan = document.getElementById('gross-value');
    const sacValueSpan = document.getElementById('sac-value');
    const tableBody = document.getElementById('table-body');
    const totalNetFooter = document.getElementById('total-net-footer');
    const imgrAlert = document.getElementById('imgr-alert');
    const installBtn = document.getElementById('install-btn');

    // PWA Install Logic
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        installBtn.style.display = 'flex';
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            // We've used the prompt, and can't use it again, throw it away
            deferredPrompt = null;
            // Hide the install button
            installBtn.style.display = 'none';
        }
    });

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('SW Registered', reg))
                .catch(err => console.log('SW Registration Failed', err));
        });
    }

    const IMGR_LIMIT = 1036390;
    const BONO_NO_REM = 35000;
    const RETENCION_PERCENT = 0.205;

    function getWorkingDays(year, month) {
        let count = 0;
        let date = new Date(year, month, 1);
        while (date.getMonth() === month) {
            const day = date.getDay();
            if (day !== 0 && day !== 6) { // Not Sunday (0) or Saturday (6)
                count++;
            }
            date.setDate(date.getDate() + 1);
        }
        return count;
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(value);
    }

    let currentNetValue = 0;
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const val = Math.floor(progress * (end - start) + start);
            obj.textContent = formatCurrency(val);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function getMonthlyGross(monthIdx, baseValue, seniority, premioPerc, totalExtras, vDays = 0) {
        const workingDays = getWorkingDays(2026, monthIdx);
        const valorHoraSeniority = baseValue * (1 + (seniority * 0.01));
        const basicoMensual = valorHoraSeniority * 200;
        const montoExtras = valorHoraSeniority * 1.5 * totalExtras;
        
        let basicoAjustado = basicoMensual;
        let vacationAmount = 0;
        if (monthIdx === 11 && vDays > 0) {
            basicoAjustado = (basicoMensual / 30) * Math.max(0, 30 - vDays);
            vacationAmount = (basicoMensual / 25) * vDays;
        }

        let bruto = basicoAjustado + montoExtras + vacationAmount;
        if (bruto < IMGR_LIMIT) {
            bruto = IMGR_LIMIT;
        }
        
        const premioMonto = bruto * (premioPerc / 100);
        return bruto + premioMonto;
    }

    function calculate() {
        const month = parseInt(monthSelect.value);
        const baseValue = parseFloat(categorySelect.value) || 0;
        const seniority = parseInt(seniorityInput.value) || 0;
        const premioPerc = parseFloat(premioInput.value) || 0;
        const totalExtras = parseFloat(totalExtrasInput.value) || 0;
        const specialJobs = parseFloat(specialJobsInput.value) || 0;
        const vacationDays = parseInt(vacationDaysInput.value) || 0;

        if (month === 11) {
            vacationGroup.style.display = 'block';
        } else {
            vacationGroup.style.display = 'none';
            vacationDaysInput.value = 0;
        }

        const workingDays = getWorkingDays(2026, month);
        workingDaysSpan.textContent = workingDays;

        const valorHoraSeniority = baseValue * (1 + (seniority * 0.01));
        const basicoMensual = valorHoraSeniority * 200;
        const montoExtras = valorHoraSeniority * 1.5 * totalExtras;
        
        let basicWorkingDays = 30;
        let vacationAmount = 0;
        if (month === 11 && vacationDays > 0) {
            basicWorkingDays = Math.max(0, 30 - vacationDays);
            vacationAmount = (basicoMensual / 25) * vacationDays;
        }
        const basicoAjustado = (basicoMensual / 30) * basicWorkingDays;

        let subtotalBruto = basicoAjustado + montoExtras + vacationAmount;
        let isImgrApplied = false;
        if (subtotalBruto < IMGR_LIMIT) {
            subtotalBruto = IMGR_LIMIT;
            isImgrApplied = true;
        }
        
        const premioMonto = subtotalBruto * (premioPerc / 100);
        const brutoSinSac = subtotalBruto + premioMonto;
        imgrAlert.style.display = isImgrApplied ? 'inline-block' : 'none';

        // SAC: Mejor mes del semestre (incluyendo premio)
        let sac = 0;
        if (month === 5 || month === 11) {
            const startMonth = month === 5 ? 0 : 6;
            const endMonth = month === 5 ? 5 : 11;
            let maxBase = 0;
            for (let i = startMonth; i <= endMonth; i++) {
                const vDays = (i === 11) ? vacationDays : 0;
                const currentMonthGross = getMonthlyGross(i, baseValue, seniority, premioPerc, totalExtras, vDays);
                if (currentMonthGross > maxBase) maxBase = currentMonthGross;
            }
            sac = maxBase / 2;
        }

        // Total Remunerativo y Retenciones
        const totalRemunerativo = brutoSinSac + sac;
        const retenciones = totalRemunerativo * RETENCION_PERCENT;
        
        // Neto Final
        const netValue = (totalRemunerativo - retenciones) + BONO_NO_REM + specialJobs;

        // Animated calculation
        animateValue(netSalaryDiv, currentNetValue, netValue, 500);
        currentNetValue = netValue;

        grossValueSpan.textContent = formatCurrency(brutoSinSac);
        sacValueSpan.textContent = formatCurrency(sac);
        totalNetFooter.textContent = formatCurrency(netValue);

        // Update Table
        const categoryName = categorySelect.options[categorySelect.selectedIndex].text.split(':')[0];
        updateTable([
            { label: `Básico (${categoryName} - ${basicWorkingDays} días)`, value: basicoAjustado },
            { label: `Horas Extras (${totalExtras} hs)`, value: montoExtras },
            { label: `Vacaciones (${vacationDays} días)`, value: vacationAmount, hideIfZero: true },
            { label: 'Ajuste IMGR', value: isImgrApplied ? (IMGR_LIMIT - (basicoAjustado + montoExtras + vacationAmount)) : 0, hideIfZero: true },
            { label: `Premio (${premioPerc}%)`, value: premioMonto, hideIfZero: true },
            { label: 'SAC (Aguinaldo)', value: sac, hideIfZero: true },
            { label: 'Retenciones (20.5%)', value: -retenciones, class: 'negative' },
            { label: 'Bono No Remunerativo', value: BONO_NO_REM },
            { label: 'Trabajos Especiales', value: specialJobs, hideIfZero: true }
        ]);
    }

    function updateTable(rows) {
        tableBody.innerHTML = '';
        rows.forEach(row => {
            if (row.hideIfZero && row.value === 0) return;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.label}</td>
                <td class="text-right ${row.class || ''}">${formatCurrency(row.value)}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Event Listeners
    [monthSelect, categorySelect, seniorityInput, premioInput, totalExtrasInput, specialJobsInput, vacationDaysInput].forEach(el => {
        el.addEventListener('input', calculate);
    });

    // Initial calculation
    calculate();
});
