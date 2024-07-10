<?php header("Access-Control-Allow-Origin: *");
			header('Content-Type: application/json');


// The base path to the archive directory, that should be listed by this script.
// Keep in mind that this is either a relative path to the location of this script, or an absolute path on your operation system!
define("BASE_PATH",	"./archive");

// Global switch for enable/disable listing of .gz compressed game log files.
//
// Background:
// In a typical use case scenarios, game logs are stored as gzip compressed archives, rather than in plain text.
// Browsers, on the other hand, typically treat directly requested gzip compressed archives as binary blobs and thus offer a download dialog to the user.
// The good news is that you can configure your webserver to set the Content-Encoding field in the response header together with an appropriate mime type for compressed game log files.
// As a result, the browser will automatically decompress the response from the server and serve the specified mime type to our ajax request. With a bit of further configuration magic, your server will also handle decompressing the archive on the server side, in case the (poor) client doesn't support gzip/deflate encoded content.
// However, since this is not the default configuration of any webserver I know of, this option is also disabled by default.
define("LIST_GZIP_FILES",	false);




// The folder/replay entry class
class Entry
{
  public $label = "";
  public $path = "";

  public static function cmpLabels($a, $b) {
	  return strcmp($a->label, $b->label);
	}
}


// Funktion used for creating an Entry object
function makeEntry($path, $fileName) {
  $lp = new Entry();
  $lp->label = $fileName;
  $lp->path = $path . $fileName;

  return $lp;
}


// Funktion used to check if a file is a replay file
function isReplay($fileName) {
	$suffix10 = substr($fileName, -10);
	$suffix9 = substr($fileName, -9);
	$suffix7 = substr($fileName, -7);
	$suffix6 = substr($fileName, -6);

	$compressedReplay = false;

	if (LIST_GZIP_FILES) {
		$compressedReplay = $suffix10 == ".replay.gz" || $suffix9 == ".rpl2d.gz" || $suffix9 == ".rpl3d.gz";
	}

	return $compressedReplay || $suffix7 == ".replay" || $suffix6 == ".rpl2d" || $suffix6 == ".rpl3d";
}


// Funktion used to check if a file is a sserver log file
function isSServerLog($fileName) {
	$suffix7 = substr($fileName, -7);
	$suffix4 = substr($fileName, -4);

	return $suffix4 == ".rcg" || (LIST_GZIP_FILES && $suffix7 == ".rcg.gz");
}


// Funktion used to check if a file is a playlist file
function isPlaylist($fileName) {
	$suffix8 = substr($fileName, -8);
	$suffix5 = substr($fileName, -5);

	return $suffix5 == ".json" || (LIST_GZIP_FILES && $suffix8 == ".json.gz");
}



$errorMsg = "";
$valid = true;
$path = '/';


// Check for path argument
if (isset($_GET['path'])) {
	// Validate external path argument
	$splitPath = explode("/", $_GET['path']);
	$path = "/";

	foreach ($splitPath as $value) {
		if ($value == "..") {
			$valid = false;
			$errorMsg = "Invalid path argument!";
			break;
		} else if ($value != "") {
			$path = $path . $value . "/";
		}
	}
}


// If rqeuest is valid, check if the requested path exists
if ($valid && !file_exists(BASE_PATH . $path)) {
	$valid = false;
	$errorMsg = "Not found!";
}


if ($valid) {
	// Valid request --> Show folder listing
	$folders = array();
	$replays = array();
	$sserverlogs = array();
	$playlists = array();

	$dirIter = new DirectoryIterator(BASE_PATH . $path);

	if ($dirIter->valid()) {
		$folderIdx = 0;
		$replayIdx = 0;
		$sserverlogIdx = 0;
		$playlistIdx = 0;

		foreach ($dirIter as $fn) {
			if ($fn->isDir() && !$fn->isDot()) {
				$folders[$folderIdx] = makeEntry($path, $fn->getFilename());
				$folderIdx++;
			} else if (!$fn->isDot()) {
				if (isReplay($fn->getFilename())) {
					$replays[$replayIdx] = makeEntry(BASE_PATH . $path, $fn->getFilename());
					$replayIdx++;
				} else if (isSServerLog($fn->getFilename())) {
					$sserverlogs[$sserverlogIdx] = makeEntry(BASE_PATH . $path, $fn->getFilename());
					$sserverlogIdx++;
				} else if (isPlaylist($fn->getFilename())) {
					$playlists[$playlistIdx] = makeEntry(BASE_PATH . $path, $fn->getFilename());
					$playlistIdx++;
				}
			}
		}

		// Sort entries
		usort($folders, array("Entry", "cmpLabels"));
		usort($replays, array("Entry", "cmpLabels"));
		usort($sserverlogs, array("Entry", "cmpLabels"));
		usort($playlists, array("Entry", "cmpLabels"));

		// Create response
		$response = array(
				"type" => "archive",
				"path" => strlen($path) > 1 ? substr($path, 0, -1) : $path,
		    "folders" => $folders,
		    "replays" => $replays,
		    "sserverlogs" => $sserverlogs,
		    "playlists" => $playlists
		);
	} else {
		$valid = false;
		$errorMsg = "Error reading directory!";
	}
}


if (!$valid) {
	// Prepare error response
	$response = array(
			"type" => "archive",
			"errorMsg" => $errorMsg
	);
}


echo json_encode($response);

?>