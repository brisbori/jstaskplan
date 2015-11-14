<?php
require_once("../db_inc.php");
$mysqli=new mysqli($dbserver,$username,$password,$database);
$result=$mysqli->query("SELECT * FROM tpoints");
while ($pointdetail=$result->fetch_assoc()) {
$pointlist[]=json_encode($pointdetail,JSON_NUMERIC_CHECK);
}
$result->close();
$mysqli->close();
echo json_encode($pointlist);
?>