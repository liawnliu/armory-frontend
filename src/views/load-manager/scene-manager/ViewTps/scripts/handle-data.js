export function tpsChartInitData() {
  return {
    title: {
      text: 'TPS实时数据'
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    // 提示框
    tooltip: {
      trigger: 'axis', // 坐标轴触发
      axisPointer: { // 坐标轴指示器配置项。
        type: 'cross', // 十字准星指示器。
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    // 图例
    legend: {
      data: ['成功TPS', '失败TPS'] // 图例的数据数组
    },
    // 直角坐标系内绘图网格
    grid: {
      show: true,
      left: '3%', // grid 组件离容器左侧的距离
      right: '4%',
      bottom: '45', // 给底部的dataZoom留出45px的空间
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowBlur: 5,
      containLabel: true // grid 区域是否包含坐标轴的刻度标签。否则可能被下面的chart遮盖
    },
    // x 轴
    xAxis: {
      type: 'category',
      boundaryGap: false, // 坐标轴两边留白策略
      // label换行
      axisLabel: {
        formatter: value => value.split(' ').join('\n')
      },
      // 网格线条
      splitLine: {
        show: true,
        lineStyle: { color: '#d3d7d4' }
      },
      data: [0]
    },
    // y 轴
    yAxis: {
      type: 'value',
      // 网格线条
      splitLine: {
        show: true,
        lineStyle: { color: '#d3d7d4' }
      }
    },
    series: [
      {
        name: '成功TPS',
        type: 'line', // 折线/面积图
        stack: '成功TPS', // 数据堆叠（要设置不同stack值，否则同一条线显示不同颜色）
        smooth: true, // 线条是否平滑
        itemStyle: {
          color: '#009966' // 设置折线图颜色
        },
        areaStyle: { color: '#009966', opacity: 0.7 }, // 区域填充样式
        emphasis: { // 折线图的高亮状态
          focus: 'series' // 聚焦当前高亮的数据所在的系列的所有图形
        },
        data: [0]
      },
      {
        name: '失败TPS',
        type: 'line',
        stack: '失败TPS', // 数据堆叠（要设置不同stack值，否则同一条线显示不同颜色）
        smooth: true, // 线条是否平滑
        itemStyle: {
          color: '#d71345' // 设置折线图颜色
        },
        areaStyle: { color: '#d71345', opacity: 0.7 }, // 区域填充样式
        emphasis: {
          focus: 'series'
        },
        data: [0]
      }],
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0, // 控制第0项的x轴
        start: 1, // 数据窗口范围的起始百分比
        end: 100, // 数据窗口范围的起始百分比
        bottom: 10
      }
    ]
  };
}
export function avgTimeChartData() {
  return {
    title: {
      text: '响应时间ms'
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    // 提示框
    tooltip: {
      trigger: 'axis', // 坐标轴触发
      axisPointer: { // 坐标轴指示器配置项。
        type: 'cross', // 十字准星指示器。
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    // 直角坐标系内绘图网格
    grid: {
      show: true,
      left: '3%', // grid 组件离容器左侧的距离
      right: '4%',
      bottom: '45', // 给底部的dataZoom留出45px的空间
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowBlur: 5,
      containLabel: true // grid 区域是否包含坐标轴的刻度标签。
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLabel: {
        formatter: value => value.split(' ').join('\n')
      },
      // 网格线条
      splitLine: {
        show: true,
        lineStyle: { color: '#d3d7d4' }
      },
      data: [0]
    },
    yAxis: {
      type: 'value',
      // 网格线条
      splitLine: {
        show: true,
        lineStyle: { color: '#d3d7d4' }
      }
    },
    series: [
      {
        data: [0],
        type: 'line', // 折线/面积图
        smooth: true, // 线条是否平滑
        itemStyle: { color: '#006666' },
        areaStyle: { color: '#006666', opacity: 0.7 }
      }
    ],
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0, // 控制第0项的x轴
        start: 1, // 数据窗口范围的起始百分比
        end: 100, // 数据窗口范围的起始百分比
        bottom: 10
      }
    ]
  };
}
export function connChartData() {
  return {
    title: {
      text: '并发数'
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    // 提示框
    tooltip: {
      trigger: 'axis', // 坐标轴触发
      axisPointer: { // 坐标轴指示器配置项。
        type: 'cross', // 十字准星指示器。
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    // 直角坐标系内绘图网格
    grid: {
      show: true,
      left: '3%', // grid 组件离容器左侧的距离
      right: '4%',
      bottom: '45', // 给底部的dataZoom留出45px的空间
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowBlur: 5,
      containLabel: true // grid 区域是否包含坐标轴的刻度标签。
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLabel: {
        formatter: value => value.split(' ').join('\n')
      },
      // 网格线条
      splitLine: {
        show: true,
        lineStyle: { color: '#d3d7d4' }
      },
      data: [0]
    },
    yAxis: {
      type: 'value',
      // 网格线条
      splitLine: {
        show: true,
        lineStyle: { color: '#d3d7d4' }
      }
    },
    series: [
      {
        data: [0],
        type: 'line', // 折线/面积图
        smooth: true, // 线条是否平滑
        itemStyle: { color: '#990066' },
        areaStyle: { color: '#990066', opacity: 0.7 }
      }
    ],
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0, // 控制第0项的x轴
        start: 1, // 数据窗口范围的起始百分比
        end: 100, // 数据窗口范围的起始百分比
        bottom: 10
      }
    ]
  };
}
