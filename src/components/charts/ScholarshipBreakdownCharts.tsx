import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import {API_BASE_URL} from "../../config.ts";

const ApplicantsBarChart = () => {
  const [chartData, setChartData] = useState({ categories: [], series: [] });

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/applicants-breakdown`);
      const data = await res.json();

      const courses = data.map(item => item.course);
      const campuses = [...new Set(data.map(item => item.campus))];

      const series = campuses.map(campus => ({
        name: campus,
        data: courses.map(course => {
          const match = data.find(
              item => item.campus === campus && item.course === course
          );
          return match ? match.total_applicants : 0;
        })
      }));

      setChartData({ categories: courses, series });
    }

    fetchData();
  }, []);

  const options = {
    chart: {
      type: 'bar',
      stacked: false
    },
    title: {
      text: 'Applicants per Course (Grouped by Campus)',
      align: 'center'
    },
    xaxis: {
      categories: chartData.categories,
      labels: { rotate: -45 }
    },
    yaxis: {
      title: {
        text: 'Total Applicants'
      }
    },
    legend: {
      position: 'top'
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%'
      }
    }
  };

  return (
      <Chart options={options} series={chartData.series} type="bar" height={400} />
  );
};

export default ApplicantsBarChart;
