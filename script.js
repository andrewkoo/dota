// Constants
var margin = {top: 50, right: 50, bottom: 50, left: 50},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,

    // Global variables
    data = [];
    csv = [];
    accumulatedData = [];
    iteration = 0;
    logScale = 0;

// Tooltip
var tooltip = d3.select("body")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden")
    .attr("class", "tooltip")

function updateTooltip(d) {
    return (
        tooltip
            .text( d.Tournament + ": $" + d.Prize.toString() )
            .style("visibility", "visible")
    );
}



// Axes and Color Scales
var x = d3.time.scale()
    .range([0, width]);
var yLog = d3.scale.log()
    .range([height, 0]);
var yLinear = d3.scale.linear()
    .range([height, 0]);
var r = d3.scale.linear()
    .range([3, 30]);
var y = yLinear;


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
        if (obj.Prize == "0") {
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
    csv = data[iteration].values;

    // Axes
    x.domain(d3.extent(csv, function(d) { return d.Date; })).nice();
    yLinear.domain([0, d3.max(csv, function(d) { return d.Prize; })]).nice();
    r.domain([0, d3.max(csv, function(d) { return d.Prize; })]);
    yLog.domain([d3.min(csv, function(d) { return d.Prize; }), d3.max(csv, function(d) { return d.Prize; })]).nice();
    

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
        .on("mouseover", function(d) { updateTooltip(d); } )
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
});


// ** Update data section (Called from the onclick)
function updateData() {

    if (iteration == 0) {
        allData = csv = data[iteration].values;
    }
    iteration++;
    if (iteration < 5) {
        csv = data[iteration].values
        allData = allData.concat(csv);
    } 
    if (iteration == 5) { // Log
        csv = [];
        y = yLog;
        yAxis.scale(y).tickValues([200, 2000, 20000, 200000, 2000000, 20000000]);
    }
    
    if (iteration > 5) { // Sums
        svg.selectAll("circle.prev.dot")
            .transition()
            .duration(750)
            .attr("cy", height)
            .attr("r", 0);
        
        var sums = data.map(function(arr) {
            sum = 0;
            for (var i = 0; i < arr.values.length; i++) {
                sum += arr.values[i].Prize;
            }
            return sum;
        });
        
//        y = yLinear;
//        yAxis.scale(y).tickValues([1]);
////        
//
//        d3.select(".x.axis").remove();
//        var format = d3.time.format("%m/%d/Y");
//        x.domain([format.parse("01/01/2011"), format.parse("01/01/2015")])
//        xAxis = d3.svg.axis()
//            .scale(x)
//            .tickFormat("%Y")
//            .orient("bottom");            
        
//        svg.append("g")
//            .attr("class", "x axis")
//            .attr("transform", "translate(0," + height + ")")
//            .call(xAxis);
//        
//        svg.selectAll(".bar")
//            .data(sums)
//            .enter().append("rect")
//            .attr("class", "bar")
//            .attr("x", function(i) { return i } )//x(format("01/01/2015")) )
//            .attr("width", (width - margin.right) / 5)
//            .attr("y", function(d) { return y(d);} )
//            .attr("height", function(d) { return height - y(d); });
        
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
        .on("mouseover", function(d) { updateTooltip(d); } )
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
    
    // Axes
    x.domain(d3.extent(allData, function(d) { return d.Date; })).nice();
    yLinear.domain([0, d3.max(allData, function(d) { return d.Prize; })]).nice();
    r.domain([0, d3.max(allData, function(d) { return d.Prize; })]);
    yLog.domain([d3.min(allData, function(d) { return d.Prize; }), d3.max(allData, function(d) { return d.Prize; })]).nice();
    
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
                
}
