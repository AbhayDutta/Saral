# Publishing Saral on Microsoft Edge Add-ons

You publish through **Partner Center**, using a free developer account.

## Steps

1. **Register as an Edge extension developer.** Before publishing, register your developer account in Partner Center. Sign in with a Microsoft account (Outlook, Hotmail, or a work account) and choose **Individual** unless you're registering as a company. Microsoft verifies the information you provide, and you can watch the status under Account settings > Legal info. Start this early, since the account has to be verified before you can publish.
2. **Build the package.** Reuse your Chrome ZIP or run `pnpm wxt zip -b edge`. Both are Manifest V3 ZIPs of the build output.
3. **Test in Edge first.** Load the unpacked build at `edge://extensions` with **Developer mode** on, and check that the hotkey, side panel, microphone permission, scanning, and filling all work.
4. **Create the extension in Partner Center.** Sign in at Partner Center, upload your .zip package manually, review the extracted extension details, and click Continue.
5. **Set availability and visibility.** Public (the default) lets everyone find the extension through search, browsing, or its listing URL, while Hidden removes it from search and browsing. Hidden is a good choice for a first test submission.
6. **Fill in Properties.** Choose a category and add your **privacy policy URL**. Microsoft's developer policies decide whether an extension needs a privacy policy, and Saral handles audio and page content, so include one. Reuse the page you host for the Chrome listing.
7. **Add the store listing.** Name, description (Hindi and English if you like), logo, and screenshots. Check the dashboard for the current image sizes.
8. **Add notes for certification.** Tell the reviewers how to test it: that it needs a hotkey, a microphone, and API access, and give a sample form URL. If the extension needs a key to run, provide a working test key or a proxy, otherwise reviewers can't verify it and may reject it.
9. **Submit for review.** After passing certification, the extension is published and its status in Partner Center changes to "In the Store". The status shows on the item's Overview page. Review usually takes a few business days, so check the dashboard for the current estimate.

## Updating later

Bump the `version`, upload a new ZIP to the same extension in Partner Center, and submit it again. The extension ID stays the same.

## Automating it (optional)

WXT's `wxt submit` can upload your package to Edge Add-ons from a GitHub workflow, and the `--edge-skip-submit-review` flag uploads without sending it to review. It needs API credentials from Partner Center, so set it up only after your first manual submission works.

## Saral-specific tips

- Keep permissions minimal (`activeTab`, `scripting`, `storage`, `sidePanel`, plus your API hosts). Reviewers check that each one is justified.
- Don't ship your own API keys in the ZIP. Use a small proxy, or let testers enter keys in the options page.
- Skip Chrome-only features in Edge: if you use `webkitSpeechRecognition` as a fallback, test it in Edge, because it may behave differently there. Your cloud STT path (Sarvam or Groq) works the same in both.

Want me to write the store description, the privacy policy text, and the reviewer notes for both stores?
