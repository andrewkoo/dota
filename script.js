// Constants
var margin = {top: 50, right: 50, bottom: 50, left: 50},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    legendWidth = 300;

    // Global variables
    data = [];
    csv = [];
    accumulatedData = [];
    currYear = 0;
    legendInfo =-1;


// Axes and Color Scales
var x = d3.time.scale()
    .range([0, width]);
var y = d3.scale.linear()
    .range([height, 0]);
var r = d3.scale.linear()
    .range([3, 50]);
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(5)
    .tickFormat(d3.time.format("%m/%Y"));
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

// Initialize SVG
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Initialize Legend
var legend = d3.select("body").append("svg")
    .attr("width", legendWidth + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(" + margin.left + "," +2 * margin.top + ")")
    .append("p")
    .attr("class", "legendinfo");



function updateLegend(d) {
    console.log(d.Tournament);
    legend
        .select("legendinfo")
        .text(d.Tournament)
       
}

// Gradient
var gradient = svg
    .append("linearGradient")
    .attr("y1", height)
    .attr("y2", 0)
    .attr("x1", "0")
    .attr("x2", "0")
    .attr("id", "gradient")
    .attr("gradientUnits", "userSpaceOnUse");
gradient
    .append("stop")
    .attr("offset", "0")
    .attr("stop-color", "#555");
gradient
    .append("stop")
    .attr("offset", ".3")
    .attr("stop-color", "#a9100d");

// Load data
d3.csv("data.csv", function(csv) {
    csv.forEach(function(d) {
        // "Tournament","Start","End","Location","Prize","Winner","Runner-Up"
        var parseDate = d3.time.format("%m/%d/%y").parse;
        d.Date = parseDate(d.Start);
        d.Year = d.Date.getFullYear();
        d.Prize = Math.round(d.Prize);
    });
    // Clean data: filter qualifier tournaments
    function filterByPrize(obj) {
        if (obj.Prize === "0") {
            return false;
        } else {
            return true;
        }
    }
    csv = csv.filter(filterByPrize);

    // Group data by year
    data = d3.nest()
        .key(function(d) { return d.Year; })
        .sortKeys(d3.ascending)
        .entries(csv);

    // Start program on first year
    csv = data[currYear].values;

    // Axes
    x.domain(d3.extent(csv, function(d) { return d.Date; })).nice();
    y.domain([0, d3.max(csv, function(d) { return d.Prize; })]).nice();
    r.domain([0, d3.max(csv, function(d) { return d.Prize; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Dollars");

    // Scatterplot
    svg.selectAll( "curr dot" )
        .data(csv)
        .enter().append("circle")
        .attr("class", "curr dot" )
        .attr("r", function(d) { return r(d.Prize); })
        .attr("cx", function(d) { return x(d.Date); })
        .attr("cy", function(d) { return y(d.Prize); })
        .attr("fill", "url(#gradient)")
        .on("mouseover", function(d) {
            updateLegend(d);
        });
});


// ** Update data section (Called from the onclick)
function updateData() {

    if (currYear == 0) {
        allData = csv = data[currYear].values;
    }
    currYear++;
    if (currYear < 5) {
        csv = data[currYear].values
        allData = allData.concat(csv);
    } else {
        console.log("Done");
        return;
    }
    
    // Scatterplot
    svg.selectAll( "circle.curr.dot" )
        .attr("class", "prev dot");

    var curr_dots = svg.selectAll( "curr dot" )
        .data(csv)
        .enter().append("circle")
        .attr("class", "curr dot" )
        .attr("r", function(d) { return r(d.Prize); })
        .attr("cy", function(d) { return y(d.Prize); })
        .attr("fill", "url(#gradient)")
        .attr("cx", width + margin.right * 2)
        .attr("fill-opacity", 0)
        .on("mouseover", function(d) {
            updateLegend(d);
        })
    
    // Axes
    x.domain(d3.extent(allData, function(d) { return d.Date; })).nice();
    y.domain([0, d3.max(allData, function(d) { return d.Prize; })]).nice();
    r.domain([0, d3.max(allData, function(d) { return d.Prize; })]);

    svg.transition()
        .select(".x.axis")
        .duration(750)
        .call(xAxis);
    svg.transition()
        .select(".y.axis")
        .duration(750)
        .call(yAxis)
    
    svg.selectAll( "circle.prev.dot" )
        .transition()
        .duration(750)
        .attr("r", function(d) { return r(d.Prize); })
        .attr("cx", function(d) { return x(d.Date); })
        .attr("cy", function(d) { return y(d.Prize); })
        .attr("fill", "url(#gradient)");
    
    curr_dots
        .transition()
        .duration(750)
        .attr("cx", function(d) { return x(d.Date); })
        .attr("r", function(d) { return r(d.Prize); })
        .attr("cy", function(d) { return y(d.Prize); })
        .attr("fill-opacity", 1);
                
}
