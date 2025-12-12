import React from 'react';

export interface Calendar2Props {
    year: number;
    month: number;
}

const Calendar2: React.FC<Calendar2Props> = ({
    year,
    month,
}) => {
    const daysInMonth:number = new Date(year, month, 0).getDate();
    const firstDay:number = new Date(year, month - 1, 1).getDay();

    const weeks: React.ReactNode[][] = [[]];
    let weekIndex:number = 0;

    for (let i = 0; i < firstDay; i++) {
        weeks[weekIndex].push(<td key={`empty-${i}`} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        if (weeks[weekIndex].length === 7) {
            weekIndex++;
            weeks[weekIndex] = [];
        }
        const date = new Date(year, month - 1, d);
        const isSunday = date.getDay() === 0;
        const isSaturday = date.getDay() === 6;
        const cls = isSunday ? 'sunday' : isSaturday ? 'saturday' : '';
        weeks[weekIndex].push(
            <td key={d} className={cls}>
                {d}
            </td>
        );
    }

    return (
        <table className="calendar2">
        <thead>
            <tr>
                <th>日</th><th>月</th><th><span style={{color: "red"}}>火</span></th>
                <th><span style={{color: "red"}}>水</span></th><th>木</th><th>金</th><th>土</th>
            </tr>
        </thead>
        <tbody>
            {weeks.map((row, i) => (
                <tr key={i}>{row}</tr>
            ))}
        </tbody>
        </table>
    );
};

export default Calendar2;