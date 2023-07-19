import React from 'react';
import { CartesianGrid, Tooltip, Legend, PieChart, Pie, ResponsiveContainer, Brush } from 'recharts';



export default function CustomPieChart(props) {
    var pieData = props.raw;
    var config = props.config;
    var cols = config.columns;
    return (
        <ResponsiveContainer width="100%" height={360}>
            <PieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }} >
                <CartesianGrid strokeDasharray='3 3' />

                {config.hasTooltip && <Tooltip />}

                {config.legend && <Legend />}
                {
                    cols.map((col, key) => (<Pie key={key} dataKey={col.col} data={pieData.map((r, skey) => {
                        var obj = {
                            record: skey
                        };
                        obj[col.col] = r[col.col];
                        return obj;
                    })} cx={((key + 1) * 35) + '%'} cy="50%" innerRadius={40} outerRadius={80} fill={col.color} label isAnimationActive={config.isAnimated} />))
                }
                <Brush dataKey={config.mainAxis} height={50} stroke="#3a7aa6" fill="transparent" margin={{ top: 5, right: 100, bottom: 5, left: 100 }}/>
            </PieChart>
        </ResponsiveContainer>
    )
}