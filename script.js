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
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'flex';
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            deferredPrompt = null;
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

    const BONO_NO_REM = 35000;
    const RETENCION_PERCENT = 0.205;

    const CATEGORIES = [
        { key: 'ingresante', label: 'Ingresante' },
        { key: 'operario_calificado', label: 'Operario Calificado' },
        { key: 'medio_oficial', label: 'Medio Oficial' },
        { key: 'operario_especializado', label: 'Operario Especializado' },
        { key: 'operario_esp_multiple', label: 'Operario Espdo. Múltiple' },
        { key: 'oficial', label: 'Oficial' },
        { key: 'oficial_multiple', label: 'Oficial Múltiple' },
        { key: 'oficial_superior', label: 'Oficial Superior' },
        { key: 'oficial_multiple_superior', label: 'Oficial Múltiple Superior' }
    ];

    const SCALES = {
        '2026-01': { name: 'Enero 2026', year: 2026, month: 0, imgr: 1036390.00, rates: { ingresante: 4313.43, operario_calificado: 4672.74, medio_oficial: 5036.08, operario_especializado: 5387.45, operario_esp_multiple: 5695.63, oficial: 5958.84, oficial_multiple: 6418.60, oficial_superior: 6418.60, oficial_multiple_superior: 6868.42 } },
        '2026-02': { name: 'Febrero 2026', year: 2026, month: 1, imgr: 1036390.00, rates: { ingresante: 4313.43, operario_calificado: 4672.74, medio_oficial: 5036.08, operario_especializado: 5387.45, operario_esp_multiple: 5695.63, oficial: 5958.84, oficial_multiple: 6418.60, oficial_superior: 6418.60, oficial_multiple_superior: 6868.42 } },
        '2026-03': { name: 'Marzo 2026', year: 2026, month: 2, imgr: 1036390.00, rates: { ingresante: 4313.43, operario_calificado: 4672.74, medio_oficial: 5036.08, operario_especializado: 5387.45, operario_esp_multiple: 5695.63, oficial: 5958.84, oficial_multiple: 6418.60, oficial_superior: 6418.60, oficial_multiple_superior: 6868.42 } },
        '2026-04': { name: 'Abril 2026', year: 2026, month: 3, imgr: 1036390.00, rates: { ingresante: 4313.43, operario_calificado: 4672.74, medio_oficial: 5036.08, operario_especializado: 5387.45, operario_esp_multiple: 5695.63, oficial: 5958.84, oficial_multiple: 6418.60, oficial_superior: 6418.60, oficial_multiple_superior: 6868.42 } },
        '2026-05': { name: 'Mayo 2026', year: 2026, month: 4, imgr: 1036390.00, rates: { ingresante: 4313.43, operario_calificado: 4672.74, medio_oficial: 5036.08, operario_especializado: 5387.45, operario_esp_multiple: 5695.63, oficial: 5958.84, oficial_multiple: 6418.60, oficial_superior: 6418.60, oficial_multiple_superior: 6868.42 } },
        '2026-06': { name: 'Junio 2026', year: 2026, month: 5, imgr: 1036390.00, rates: { ingresante: 4313.43, operario_calificado: 4672.74, medio_oficial: 5036.08, operario_especializado: 5387.45, operario_esp_multiple: 5695.63, oficial: 5958.84, oficial_multiple: 6418.60, oficial_superior: 6418.60, oficial_multiple_superior: 6868.42 } },
        '2026-07': { name: 'Julio 2026', year: 2026, month: 6, imgr: 1036390.00, rates: { ingresante: 4313.43, operario_calificado: 4672.74, medio_oficial: 5036.08, operario_especializado: 5387.45, operario_esp_multiple: 5695.63, oficial: 5958.84, oficial_multiple: 6418.60, oficial_superior: 6418.60, oficial_multiple_superior: 6868.42 } },
        '2026-08': { name: 'Agosto 2026', year: 2026, month: 7, imgr: 1117862.00, rates: { ingresante: 4485.97, operario_calificado: 4859.65, medio_oficial: 5237.53, operario_especializado: 5602.95, operario_esp_multiple: 5923.46, oficial: 6197.19, oficial_multiple: 6675.34, oficial_superior: 6675.34, oficial_multiple_superior: 7143.16 } },
        '2026-09': { name: 'Septiembre 2026', year: 2026, month: 8, imgr: 1131201.00, rates: { ingresante: 4485.97, operario_calificado: 4859.65, medio_oficial: 5237.53, operario_especializado: 5602.95, operario_esp_multiple: 5923.46, oficial: 6197.19, oficial_multiple: 6675.34, oficial_superior: 6675.34, oficial_multiple_superior: 7143.16 } },
        '2026-10': { name: 'Octubre 2026', year: 2026, month: 9, imgr: 1160976.00, rates: { ingresante: 4665.41, operario_calificado: 5054.03, medio_oficial: 5447.03, operario_especializado: 5827.06, operario_esp_multiple: 6160.40, oficial: 6445.08, oficial_multiple: 6942.35, oficial_superior: 6942.35, oficial_multiple_superior: 7428.88 } },
        '2026-11': { name: 'Noviembre 2026', year: 2026, month: 10, imgr: 1187653.00, rates: { ingresante: 4665.41, operario_calificado: 5054.03, medio_oficial: 5447.03, operario_especializado: 5827.06, operario_esp_multiple: 6160.40, oficial: 6445.08, oficial_multiple: 6942.35, oficial_superior: 6942.35, oficial_multiple_superior: 7428.88 } },
        '2026-12': { name: 'Diciembre 2026', year: 2026, month: 11, imgr: 1219153.00, rates: { ingresante: 4852.02, operario_calificado: 5256.19, medio_oficial: 5664.91, operario_especializado: 6060.15, operario_esp_multiple: 6406.81, oficial: 6702.88, oficial_multiple: 7220.05, oficial_superior: 7220.05, oficial_multiple_superior: 7726.04 } },
        '2027-01': { name: 'Enero 2027', year: 2027, month: 0, imgr: 1242469.00, rates: { ingresante: 4949.06, operario_calificado: 5361.32, medio_oficial: 5778.21, operario_especializado: 6181.35, operario_esp_multiple: 6534.95, oficial: 6836.94, oficial_multiple: 7364.45, oficial_superior: 7364.45, oficial_multiple_superior: 7880.56 } },
        '2027-02': { name: 'Febrero 2027', year: 2027, month: 1, imgr: 1242469.00, rates: { ingresante: 4949.06, operario_calificado: 5361.32, medio_oficial: 5778.21, operario_especializado: 6181.35, operario_esp_multiple: 6534.95, oficial: 6836.94, oficial_multiple: 7364.45, oficial_superior: 7364.45, oficial_multiple_superior: 7880.56 } },
        '2027-03': { name: 'Marzo 2027', year: 2027, month: 2, imgr: 1264080.00, rates: { ingresante: 5122.28, operario_calificado: 5548.96, medio_oficial: 5980.44, operario_especializado: 6397.70, operario_esp_multiple: 6763.67, oficial: 7076.23, oficial_multiple: 7622.20, oficial_superior: 7622.20, oficial_multiple_superior: 8156.38 } },
        '2027-04': { name: 'Abril 2027', year: 2027, month: 3, imgr: 1279941.65, rates: { ingresante: 5327.17, operario_calificado: 5770.92, medio_oficial: 6219.66, operario_especializado: 6653.61, operario_esp_multiple: 7034.22, oficial: 7359.28, oficial_multiple: 7927.09, oficial_superior: 7927.09, oficial_multiple_superior: 8482.63 } }
    };

    function updateCategoryOptions() {
        const periodKey = monthSelect.value;
        const scale = SCALES[periodKey] || SCALES['2026-08'];
        const currentSelected = categorySelect.value || 'operario_especializado';

        categorySelect.innerHTML = CATEGORIES.map(cat => {
            const rate = scale.rates[cat.key];
            const selectedAttr = cat.key === currentSelected ? 'selected' : '';
            return `<option value="${cat.key}" ${selectedAttr}>${cat.label}: ${formatCurrency(rate)}</option>`;
        }).join('');
    }

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

    function getMonthlyGross(periodKey, catKey, seniority, premioPerc, totalExtras, vDays = 0) {
        const scale = SCALES[periodKey] || SCALES['2026-08'];
        const baseValue = scale.rates[catKey] || 0;
        const valorHoraSeniority = baseValue * (1 + (seniority * 0.01));
        const basicoMensual = valorHoraSeniority * 200;
        const montoExtras = valorHoraSeniority * 1.5 * totalExtras;
        
        let basicWorkingDays = 30;
        let vacationAmount = 0;
        if (scale.month === 11 && vDays > 0) {
            basicWorkingDays = Math.max(0, 30 - vDays);
            vacationAmount = (basicoMensual / 25) * vDays;
        }
        const basicoAjustado = (basicoMensual / 30) * basicWorkingDays;

        let bruto = basicoAjustado + montoExtras + vacationAmount;
        if (bruto < scale.imgr) {
            bruto = scale.imgr;
        }
        
        const normalHours = (200 / 30) * basicWorkingDays;
        const valorHoraPremio = valorHoraSeniority * (premioPerc / 100);
        const premioMonto = (normalHours + totalExtras) * valorHoraPremio;
        return bruto + premioMonto;
    }

    function calculate() {
        const periodKey = monthSelect.value;
        const scale = SCALES[periodKey] || SCALES['2026-08'];
        const catKey = categorySelect.value || 'operario_especializado';
        const baseValue = scale.rates[catKey] || 0;
        const seniority = parseInt(seniorityInput.value) || 0;
        const premioPerc = parseFloat(premioInput.value) || 0;
        const totalExtras = parseFloat(totalExtrasInput.value) || 0;
        const specialJobs = parseFloat(specialJobsInput.value) || 0;
        const vacationDays = parseInt(vacationDaysInput.value) || 0;

        // Mostrar/ocultar campo de vacaciones en Diciembre
        if (scale.month === 11) {
            vacationGroup.style.display = 'block';
            vacationGroup.style.opacity = '1';
        } else {
            vacationGroup.style.display = 'none';
            vacationDaysInput.value = 0;
        }

        const workingDays = getWorkingDays(scale.year, scale.month);
        workingDaysSpan.textContent = workingDays;

        const valorHoraSeniority = baseValue * (1 + (seniority * 0.01));
        const basicoMensual = valorHoraSeniority * 200;
        const montoExtras = valorHoraSeniority * 1.5 * totalExtras;
        
        let basicWorkingDays = 30;
        let vacationAmount = 0;
        if (scale.month === 11 && vacationDays > 0) {
            basicWorkingDays = Math.max(0, 30 - vacationDays);
            vacationAmount = (basicoMensual / 25) * vacationDays;
        }
        const basicoAjustado = (basicoMensual / 30) * basicWorkingDays;

        let subtotalBruto = basicoAjustado + montoExtras + vacationAmount;
        let isImgrApplied = false;
        if (subtotalBruto < scale.imgr) {
            subtotalBruto = scale.imgr;
            isImgrApplied = true;
        }
        
        const normalHours = (200 / 30) * basicWorkingDays;
        const valorHoraPremio = valorHoraSeniority * (premioPerc / 100);
        const premioMonto = (normalHours + totalExtras) * valorHoraPremio;
        const brutoSinSac = subtotalBruto + premioMonto;
        imgrAlert.style.display = isImgrApplied ? 'inline-block' : 'none';
        imgrAlert.textContent = `Ajustado por IMGR (${formatCurrency(scale.imgr)})`;

        // SAC: Mejor mes del semestre (incluyendo premio)
        let sac = 0;
        if (scale.month === 5 || scale.month === 11) {
            const yearStr = scale.year.toString();
            const semesterKeys = scale.month === 5 
                ? [`${yearStr}-01`, `${yearStr}-02`, `${yearStr}-03`, `${yearStr}-04`, `${yearStr}-05`, `${yearStr}-06`]
                : [`${yearStr}-07`, `${yearStr}-08`, `${yearStr}-09`, `${yearStr}-10`, `${yearStr}-11`, `${yearStr}-12`];
            
            let maxBase = 0;
            semesterKeys.forEach(pKey => {
                const vDays = (pKey.endsWith('-12')) ? vacationDays : 0;
                const currentMonthGross = getMonthlyGross(pKey, catKey, seniority, premioPerc, totalExtras, vDays);
                if (currentMonthGross > maxBase) maxBase = currentMonthGross;
            });
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
        const catObj = CATEGORIES.find(c => c.key === catKey);
        const categoryName = catObj ? catObj.label : 'Categoría';
        updateTable([
            { label: `Básico (${categoryName} - ${basicWorkingDays} días)`, value: basicoAjustado },
            { label: `Horas Extras (${totalExtras} hs)`, value: montoExtras },
            { label: `Vacaciones (${vacationDays} días) — Sueldo/25 × días`, value: vacationAmount, hideIfZero: true },
            { label: 'Ajuste IMGR', value: isImgrApplied ? (scale.imgr - (basicoAjustado + montoExtras + vacationAmount)) : 0, hideIfZero: true },
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

    // Event listeners
    monthSelect.addEventListener('change', () => {
        updateCategoryOptions();
        calculate();
    });

    [categorySelect, seniorityInput, premioInput, totalExtrasInput, specialJobsInput, vacationDaysInput].forEach(el => {
        el.addEventListener('input', calculate);
        el.addEventListener('change', calculate);
    });

    // Initial setup
    updateCategoryOptions();
    calculate();
});
