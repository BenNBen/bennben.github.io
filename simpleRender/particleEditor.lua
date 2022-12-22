str1 = [=[
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>Particle Editor</title>
	$FAVICON
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, minimal-ui">
<meta name="apple-mobile-web-app-capable" content="yes" >
<link rel="stylesheet" type="text/css" href = '../../../../lib/webAssets/assets/stylesheets/base.css'/>

<style>
  html, body, div, canvas {
margin: 0;
padding: 0;
font-weight:bold;
}

.button{
  background-color: white;
  border-radius: 4px;
  border: 2px solid red;
  -webkit-transition-duration: 0.4s
  transition-duration: 0.4s;
  cursor: pointer;
}

.buttonHover{
  background-color: white;
  border-radius: 4px;
  border: 2px solid red;
  font-weight: bold
}

.buttonHover:hover{
  background-color: red;
  border-radius: 4px;
  border: 2px solid white;
  font-weight: bold
}

.buttonP{
	background-color: gray;
	border-radius: 4px;
	border: 2px solid white;
	font-weight: bold;
	color: white;
}

.buttonP:hover{
	background-color: blue;
	border-radius: 4px;
	border: 2px solid white;
	font-weight: bold;
	color: white;
}
.dropbtn {
	background-color: white;
    color: black;
    border: 2px solid red;
	font-weight: bold;
	border-radius: 4px;
    cursor: pointer;
}
.dropdown {

    display: inline-block;
}
.dropdown-content{
	display: none;
    position: absolute;
    min-width: 160px;
}
.dropdown-content emitters {
    color: black;
    text-decoration: none;
}
.dropdown-content emitters:hover {}

.dropdown:hover .dropdown-content {
    display: block;
}

.dropdown:hover .dropbtn {
    background-color: red;
	border: 2px solid white;
}

form{
	width: 25%;
	box-sizing: border-box;
    border: 2px solid red;
    border-radius: 4px;
}

input{
	width: 20%;
	margin: 2px 0;
    box-sizing: border-box;
    border: 2px solid red;
    border-radius: 4px;
}

table.data, tr.data, th.data {
  border-bottom: 1px solid #ddd;

}

table.data {
    border-collapse: collapse;
    width: 100%;
}

th {
    text-align: left;
}
</style>
</head>

]=]

str2 =[=[

<body bgColor="black" text="white" onload=$ONLOAD onresize="gotResize()">
<script type="text/javascript">
	nan = 0
	HOME = "%s";
	HOST = "%s";
	PORT = "%s";
	PROJECT = "%s";
	USERID = %d
</script>
	<script type="text/javascript"> var projectService = 0 </script>
	<script type="text/javascript"> var ipAddress = HOST </script>
	<script type="text/javascript"> var homePath = HOME </script>
	<script type="text/javascript"> var port = PORT </script>
	<script type="text/javascript"> var userID = USERID </script>
<div class = "wrapper" style="margin: 0 auto; position: relative;">
	<canvas id="example" width="1026" height="768">
	Please use a browser that supports "canvas."
	</canvas>
	</div>
</div>
	<script src="pSphere1_DmmAutoMesh_DmmObject_EXT_G1.js"></script>
	$INCLUDES
	<noscript>Sorry, your browser does not support JavaScript!</noscript>
	<input type="file" name="textureFile" id="textFile" accept=".png">
  <table>
	  <tr>
	    <td><button class="buttonHover buttonHover" onclick="hideTouchControls()">Hide Touch Controls</button></td>
	    <td><button class="buttonHover buttonHover" onclick="restart()">Restart</button></td>
	  </tr>
	  <tr>
	    <td><button class="buttonHover buttonHover" onclick="showTouchControls()">Show Touch Controls</button></td>
	    <td><button class="buttonHover buttonHover" onclick="goFullScreen()">Fullscreen</button></td>
		<td><button class="buttonHover buttonHover" onclick="goFillWindow()">Fill Window</button></td>

	  </tr>
	  <tr>
	      <td><button class="buttonHover buttonHover" onclick="goNoFillWindow()">Don't Fill Window</button></td>
		  <td><button class="buttonHover buttonHover" onclick="reconnect()">Reconnect</button></td>
	  </tr>
	</table>
  <table class="data">
    <tr class="data">
      <th>Shadow Type</th>
      <th>Data Type</th>
    </tr>
    <tr class="data">
      <td><input type="radio" name="shadows" id="hard" value="0" onclick="shadowType(this)" >Hard Shadows</td>
		  <td><input type="radio" name="dataType" id="fixed" value="0" onclick="switchData(this)" >Fixed Point</td>
    </tr>
    <tr class="data">
      <td><input type="radio" name="shadows" id="soft" value="1" onclick="shadowType(this)" >Soft Shadows</td>
      <td><input type="radio" name="dataType" id="float" value="1" onclick="switchData(this)" >Float</td>
    </tr>
    <tr class="data">
      <td><input type="radio" name="shadows" id="soft interpolated" value="2" onclick="shadowType(this)" >Lerped Soft Shadows</td>
    </tr>
	</table>
  <br><button class="buttonHover buttonHover" onclick="changeData()">Regenerate Shaders</button>
  <h4>FPS</h4>
	<table class="fps">
	    <tr class="fps">
	    <td><input type="radio" name="fps" id="15" value="3" onclick="lockFPS(this)">15 FPS</td>
	    <td><input type="radio" name="fps" id="20" value="2" onclick="lockFPS(this)">20 FPS</td>
	    <td><input type="radio" name="fps" id="30" value="1" onclick="lockFPS(this)">30 FPS</td>
	    <td><input type="radio" name="fps" id="60" value="0" onclick="lockFPS(this)">60 FPS</td>
	    <td><input type="radio" name="fps" id="AutoFPS" value="4" onclick="lockFPS(this)">AUTO FPS</td>
	    </tr>
	</table>
	<h4>Resolution</h4>
	<table class="resolution">
	    <tr class="resolution">
	    <td><input type="radio" name="resolution" id="1" value="4" onclick="changeResolution(this)">Full Resolution</td>
	    <td><input type="radio" name="resolution" id=".67" value="3" onclick="changeResolution(this)">2/3 Resolution</td>
	    <td><input type="radio" name="resolution" id=".5" value="2" onclick="changeResolution(this)">1/2 Resolution</td>
	    <td><input type="radio" name="resolution" id=".33" value="1" onclick="changeResolution(this)">1/3 Resolution</td>
	    <td><input type="radio" name="resolution" id=".25" value="0" onclick="changeResolution(this)">1/4 Resolution</td>
	    </tr>
	</table>
  <p>
	  Player Name:&nbsp<textarea rows="1" cols="11" id="pname" maxlength="11"></textarea>
	</p>
</body>
</html>

]=]

estr = [=[
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>Particle Project</title>
</head>
<body>
<p>
Not Logged In.
</p>
</body>
</html>
]=]

local function readIncludes()
	local f = io.open(base.."/lib/particleEditor/includes.html")
	if not f then
		return string.format("<!-- could not open %s -->", base.."/lib/particleEditor/includes.html")
	end
	local str = f:read("*a")
	f:close()
	return str
end

local function readFavicon()
	local f = io.open(base.."/lib/webAssets/assets/favicon/favicon.html")
	if not f then
		return string.format("<!-- could not open %s -->", base.."/lib/webAssets/assets/favicon/favicon.html")
	end
	local str = f:read("*a")
	f:close()
	print("FAVICON",str)
	return str
end

accountutil = require"accountutil"
loginCode = params["user"]
if not loginCode then
	echo(estr)
	return
end
str1 = string.gsub(str1, "$FAVICON", readFavicon())

echo(str1)

userNumber = accountutil.findUserID(loginCode) or 1
print("TEST OVER HERE")
str1 = string.gsub(str1, "$FAVICON", readFavicon())
str2 = string.gsub(str2, "$INCLUDES", readIncludes())

if noLogin == false then
	str2 = string.gsub(str2, "$ONLOAD", '"doServer('..userNumber..', false);"') -- substitute in userID to perform check
else
	str2 = string.gsub(str2, "$ONLOAD", '"doServer('..userNumber..', true);"')
end

local effect = params["effect"] or ""

echo(string.format(str2, home, ipaddress, port, effect, userNumber))
