import * as d3 from 'd3';

export async function loadChart(data) {
    const svg = d3.select('svg');
    
    svg.selectAll("*").remove();

    const width = +svg.style("width").replace("px", "");
    const height = +svg.style("height").replace("px", "");

    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = 150;
    const innerRadius = outerRadius - 50;
    const arcAngle = (2 * Math.PI) / 24;

    const clockGroup = svg.append("g")
        .attr("transform", `translate(${centerX},${centerY})`);

    // Definindo escala de cores para média de gorjetas (tip amount)
    const maxTip = d3.max(data, d => d.avg_tip_amount);
    const minTip = d3.min(data, d => d.avg_tip_amount)
    const colorScale = d3.scaleSequential()
        .domain([minTip -1, maxTip])
        .interpolator(d3.interpolatePurples);

    // Define ângulo por fatia (hora)
    const arcGenerator = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    // Desenha cada fatia do anel com cor proporcional ao avg_tip
    clockGroup.selectAll('path')
        .data(data)
        .join('path')
        .attr('d', d => {
            const startAngle = +d.hour_of_day * arcAngle;
            const endAngle = startAngle + arcAngle;
            return arcGenerator({ startAngle, endAngle });
        })
        .attr('fill', d => colorScale(d.avg_tip_amount));

    //Colocando os ticks e legendas das horas
    const tickLength = 10;  
    const labelRadius = outerRadius + 20; 

    for (let i = 0; i < 24; i++) {
      const angle = i * arcAngle - Math.PI / 2;

      // Coordenadas do tick interno e externo (na borda do anel)
      const x1 = Math.cos(angle) * (outerRadius + tickLength);
      const y1 = Math.sin(angle) * (outerRadius + tickLength);
      const x2 = Math.cos(angle) * (outerRadius - tickLength);
      const y2 = Math.sin(angle) * (outerRadius - tickLength);

      // Linha do tick
      clockGroup.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', 'black')
        .attr('stroke-width', 2);

      // Texto do label da hora
      const lx = Math.cos(angle) * labelRadius;
      const ly = Math.sin(angle) * labelRadius;

      clockGroup.append('text')
        .attr('x', lx)
        .attr('y', ly)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '13px')
        .text(i.toString().padStart(2, '0') + "h");
    }

}



export function clearChart() {
    d3.select('svg').selectAll("*").remove();
}

