import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import {API_BASE_URL} from "../../config.ts";

const ApplicationsTrendChart = () => {
    const [selectedYear, setSelectedYear] = useState('2025');
    const [series, setSeries] = useState([{ name: 'Applications', data: [] }]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchData(selectedYear);
    }, [selectedYear]);

    const fetchData = async (year) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/dashboard/applications-trend?year=${year}`);
            const data = await res.json();

            const months = data.map(item => item.month);
            const counts = data.map(item => item.total_applications);

            setCategories(months);
            setSeries([{ name: 'Applications', data: counts }]);
        } catch (error) {
            console.error('Error fetching application trends:', error);
        }
    };

    const options = {
        chart: {
            type: 'area',
            toolbar: { show: false }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' },
        xaxis: {
            categories,
            title: { text: 'Month' }
        },
        yaxis: {
            title: { text: 'Applications' }
        },
        title: {
            text: `Application Trends - ${selectedYear}`,
            align: 'left'
        }
    };

    return (
        <div className="col-lg-8 mb-4">
            <div className="card">
                <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                    <span>Application Trends</span>
                    <select
                        className="form-control w-auto"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                    </select>
                </div>
                <div className="card-body">
                    <Chart
                        options={options}
                        series={series}
                        type="area"
                        height={300}
                    />
                </div>
            </div>
        </div>
    );
};

export default ApplicationsTrendChart;
