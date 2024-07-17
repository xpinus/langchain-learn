process.stdout.write("Loading");

setTimeout(() => {
	process.stdout.write("\rLoading.");
}, 1000);

setTimeout(() => {
	process.stdout.write("\rLoading..");
}, 2000);

setTimeout(() => {
	process.stdout.write("\rLoading...");
}, 3000);
