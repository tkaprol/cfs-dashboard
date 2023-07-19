import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip, ResponsiveContainer, Brush } from 'recharts';



export default function CustomRadarChart(props) {
    var radarData = props.raw;
    var config = props.config;
    var cols = config.columns;
    return (
        <ResponsiveContainer width="100%" height="100%" minHeight={360}>
            <RadarChart data={radarData} margin={{ top: 5, right: 30, left: 80, bottom: 5 }} >
                <PolarGrid />
                {config.mainAxis ? <PolarAngleAxis dataKey={config.mainAxis} /> : <PolarAngleAxis dataKey={cols[0].col} />}
                <PolarRadiusAxis />
                {config.hasTooltip && <Tooltip />}

                {
                    cols.map((col, key) => {
                        if (col.visible) {
                            return <Radar height={0} name={col.col} key={key} isAnimationActive={config.isAnimated} dataKey={col.col} stroke={col.color} fill={col.color} />
                        }
                    })
                }
                {config.legend && <Legend height={0} />}

                <Brush dataKey={config.mainAxis} height={50} stroke="#3a7aa6" fill="transparent" margin={{ top: 50, right: 100, bottom: 5, left: 100 }}
                />
            </RadarChart>
        </ResponsiveContainer>

    )
}