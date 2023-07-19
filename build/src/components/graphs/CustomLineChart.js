import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,  Brush, ResponsiveContainer } from 'recharts';

export default function CustomLineChart(props) {
    const lineData = props.raw;
    const config = props.config;
    const cols = config.columns;
    return (
        <ResponsiveContainer width="100%"  height={360}>
            <LineChart data={lineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} >
                <CartesianGrid strokeDasharray='3 3' />
                {config.mainAxis ?
                    <XAxis dataKey={config.mainAxis} >
                    </XAxis>
                    : <XAxis dataKey={cols[0].col} />}

                {config.hasTooltip && <Tooltip />}

                {config.legend && <Legend />}

                <YAxis orientation='left' />
                {
                    cols.map((col, key) => {
                        if (col.visible) {
                            return <Line type="monotone" key={key} dataKey={col.col} stroke={col.color} activeDot={{ r: 8 }} isAnimationActive={config.isAnimated} />
                        }
                    })
                }
                <Brush dataKey={config.mainAxis} height={50} stroke="#3a7aa6" className="brush-cancel"  fill="transparent" margin={{ top: 5, right: 100, bottom: 5, left: 100 }} />
            </LineChart>
        </ResponsiveContainer>
    )
}