import { Taxi } from "./taxi";
import { loadChart, clearChart } from './plot';

function callbacks(data) {
    const loadBtn  = document.querySelector('#loadBtn');
    const clearBtn = document.querySelector('#clearBtn');

    if (!loadBtn || !clearBtn) {
        return;
    }

    loadBtn.addEventListener('click', async () => {
        clearChart();
        await loadChart(data);
    });

    clearBtn.addEventListener('click', async () => {
        clearChart();
    });
}

window.onload = async () => {
    const taxi = new Taxi();

    await taxi.init();
    await taxi.loadTaxi();

const sql = `
    SELECT
        STRFTIME('%H', lpep_pickup_datetime) AS hour_of_day,
        AVG(tip_amount) AS avg_tip_amount
    FROM taxi_2023
    WHERE tip_amount > 0
    GROUP BY hour_of_day
    ORDER BY hour_of_day;

    `;


    const data = await taxi.query(sql);
    console.log(data);

    callbacks(data);
};

