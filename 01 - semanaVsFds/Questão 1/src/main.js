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
           CASE STRFTIME('%w', lpep_pickup_datetime)
               WHEN '0' THEN 'Domingo'
               WHEN '1' THEN 'Segunda'
               WHEN '2' THEN 'Terça'
               WHEN '3' THEN 'Quarta'
               WHEN '4' THEN 'Quinta'
               WHEN '5' THEN 'Sexta'
               WHEN '6' THEN 'Sábado'
           END AS day_name,
           COUNT(*) AS total_trips,
           SUM(CASE WHEN passenger_count > 1 THEN 1 ELSE 0 END) AS multi_passenger_trips,
           AVG(CASE 
               WHEN (julian(lpep_dropoff_datetime) - julian(lpep_pickup_datetime)) * 60 > 0 
                    AND trip_distance > 0 
               THEN 
                   trip_distance / ((julian(lpep_dropoff_datetime) - julian(lpep_pickup_datetime)) * 60)
           END
           ) AS avg_speed_mph
       FROM taxi_2023
       WHERE
           trip_distance > 0
           AND (julian(lpep_dropoff_datetime) - julian(lpep_pickup_datetime)) * 60 > 0
       GROUP BY day_name;
    `;


    const data = await taxi.query(sql);
    console.log(data);

    callbacks(data);
};

