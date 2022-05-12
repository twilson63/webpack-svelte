<script>
	import { WebBundlr } from "@bundlr-network/client/build/web";
	import * as nearAPI from "near-api-js";
	import { WalletConnection } from "near-api-js";
	import { onMount } from "svelte";
	const { connect, keyStores } = nearAPI;
	let wallet, signedIn, text, amount, balance;

	console.log({ WebBundlr });

	const c = {
		networkId: "mainnet",
		keyStore: new keyStores.BrowserLocalStorageKeyStore(),
		nodeUrl: "https://rpc.mainnet.near.org",
		walletUrl: "https://wallet.mainnet.near.org",
		helperUrl: "https://helper.mainnet.near.org",
	};
	onMount(async () => {
		const near = await connect(c);
		wallet = new WalletConnection(near, "bundlr");
		signedIn = wallet.isSignedIn();
	});

	async function doConnect() {
		if (!wallet.isSignedIn()) {
			console.log({
				status: "info",
				title: "You are being redirected to authorize this application...",
			});
			window.setTimeout(() => {
				wallet.requestSignIn();
			}, 4000);
			// wallet.requestSignIn();
		} else if (
			!(await c.keyStore.getKey(wallet._networkId, wallet.getAccountId()))
		) {
			console.log({
				status: "warning",
				title:
					"Click 'Connect' to be redirected to authorize access key creation.",
			});
		}
		return wallet;
	}

	async function doDisconnect() {
		wallet.signOut();
		signedIn = false;
	}

	async function createPost() {
		const bundlr = new WebBundlr(
			"https://node1.bundlr.network",
			"near",
			wallet
		);
		await bundlr.ready();

		let tx = await bundlr.createTransaction(text, {
			tags: [{ name: "Content-Type", value: "text/plain" }],
		});
		console.log("tx", tx);
		await tx.sign();
		console.log("tx", tx);
		const result = await tx.upload().catch((e) => {
			console.log(`Error posting message - ${e.stackTrace ?? e}`);
		});
		console.log(result.data.id);
	}

	async function getBalance() {
		const bundlr = new WebBundlr(
			"https://node1.bundlr.network",
			"near",
			wallet
		);
		await bundlr.ready();
		balance = (await bundlr.getLoadedBalance()).toString();

		console.log("price", (await bundlr.getPrice(100)).toString());
		// console.log("address", bundlr.address);
		// console.log(
		// 	"getLoadedBalance",
		// 	(await bundlr.getLoadedBalance()).toString()
		// );
	}

	async function fund() {
		const bundlr = new WebBundlr(
			"https://node1.bundlr.network",
			"near",
			wallet
		);
		await bundlr.ready();
		await bundlr.fund(amount);
		amount = "";
	}
</script>

<h1>Near Connect</h1>
{#if signedIn}
	<button on:click={doDisconnect}>Disconnect</button>
	<h2>{wallet.getAccountId()}</h2>
	<input bind:value={text} />
	<button on:click={createPost}>Create Post</button>
	<hr />
	{balance}
	<button on:click={getBalance}>Get Balance</button>
	<hr />
	<input bind:value={amount} />
	<button on:click={fund}>Fund Bundlr</button>
{:else}
	<button on:click={doConnect}>Connect</button>
{/if}
