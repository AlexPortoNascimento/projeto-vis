import * as d3 from 'd3';


export async function loadChart(data, margens = { left: 50, right: 25, top: 25, bottom: 50 }) {
    const svg = d3.select('svg');

    //Converte o valor de bigInt para Number
    data.forEach(d => {
        d.total_trips = Number(d.total_trips);
        d.multi_passenger_trips = Number(d.multi_passenger_trips);
        d.avg_speed_mph = Number(d.avg_speed_mph);
    });
    
    //Limpa o svg antes de desenhar
    svg.selectAll("*").remove();

    //Calcula o tamno do gráfico, descontando a margens
    const width = +svg.style("width").split("px")[0];
    const height = +svg.style("height").split("px")[0];

    const innerWidth = width - margens.left - margens.right;
    const innerHeight = height - margens.top - margens.bottom;

    //Gráfico dentro do grupo
    const group = svg.append("g")
        .attr("transform", `translate(${margens.left},${margens.top})`);

    //Ordenação dos dias da semana
    const daysOrder = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        data.sort((a, b) => daysOrder.indexOf(a.day_name) - daysOrder.indexOf(b.day_name));

    //Escala do eixo X, usando os dias da semana
    const x = d3.scaleBand()
        .domain(data.map(d => d.day_name))
        .range([0, innerWidth])
        .padding(0.1);

    //Escala do eixo Y, usando uma escala linear de total de corridas, começando do 0
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total_trips)])
        .nice()
        .range([innerHeight, 0]);
    
    //Definindo a escala de cores baseado na velocidade média do dia
    const minSpeed = d3.min(data, d => d.avg_speed_mph);
    const maxSpeed = d3.max(data, d => d.avg_speed_mph);

    const colorScale = d3.scaleSequential()
        .domain([0, maxSpeed])
        .interpolator(d3.interpolateBlues);

    //Colocando o eixo X no fundo do gráfico e o Y à esquerda
    group.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x));

    group.append("g")
        .call(d3.axisLeft(y).
            ticks(5).tickFormat(d => {
                if (d >= 1_000_000) return (d / 1_000_000).toFixed(1) + "M"
                if (d >= 1_000) return (d / 1_000).toFixed(0) + "K"
                return d;
            }));

    //Colocando a legenda de dias da semana no eixo X
    group.append('text')
        .attr('class', 'x label')
        .attr('text-anchor', 'middle')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + margens.bottom - 10)
        .text('Dia da Semana');
    
    //Colocando a legenda de total de corridas no eixo Y    
    group.append('text')
        .attr('class', 'y label')
        .attr('text-anchor', 'middle')
        .attr('x', -innerHeight / 2)
        .attr('y', -margens.left + 15)
        .attr('transform', 'rotate(-90)')
        .text('Número de Corridas');

    //Criando as barras retangulares
    group.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.day_name))
        .attr("y", d => y(d.total_trips))
        .attr("width", x.bandwidth())
        .attr("height", d => innerHeight - y(d.total_trips))
        .attr("fill", d => colorScale(d.avg_speed_mph));
    
    //Definindo a linha, relacionando com a quantidade de passageiros e centralizando no meio das barras
    const line = d3.line()
        .x(d => x(d.day_name) + x.bandwidth() / 2)
        .y(d => y(d.multi_passenger_trips));
    
    //Definindo as características da linha
    group.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 5)
            .attr("d", line);

}

export function clearChart() {
    d3.select('svg').selectAll("*").remove();
}

