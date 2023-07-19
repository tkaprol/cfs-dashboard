import React from 'react';
import {
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    Label,
    Brush,
} from 'recharts';

export default function CustomBarChart(props) {
    const { raw, config } = props;
    const cols = config.columns;
    return (
        <ResponsiveContainer width="100%" height={360}>
            <BarChart data={raw}  margin={{top:5, right:30, left:20, bottom:5}} >
                <CartesianGrid strokeDasharray="3 3" />
                {config.mainAxis.length > 0 ? (
                    <XAxis dataKey={config.mainAxis} margin={{ top: 0, right: 0, left: 0, bottom: 25 }}>
                    </XAxis>
                ) : (
                    <XAxis dataKey={cols[0].col} height={50} >
                        <Label value="" offset={0} position="insideBottomRight" />
                    </XAxis>
                )}
                <Brush dataKey={config.mainAxis} height={50} stroke="#3a7aa6" className="brush-cancel" fill="transparent" margin={{ top: 5, right: 100, bottom: 5, left: 100 }}
                />
                <YAxis orientation="left" />
                {cols.map((col, key) => {
                    if (col.visible) {
                        return <Bar key={key} isAnimationActive={config.isAnimated} dataKey={col.col} fill={col.color} />;
                    }
                })}
                {config.hasTooltip && <Tooltip />}
                {config.legend && <Legend height={50} />}
            </BarChart>

        </ResponsiveContainer>
    );
}
