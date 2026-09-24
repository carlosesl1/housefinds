# Lora optical sizing

The editorial family stays Lora at its existing 500/600 weights. The scoped `--hf-editorial-scale: .9` token reduces the existing display sizes by 10%, across all clamp minimum/preferred/maximum values and mobile/tablet overrides. It applies to the Home hero, section headings, three campaign headings, dark Featured Find title and Under £20 collection heading. Unitless line-height and text balancing remain, so text reflows in normal layout rather than being visually shrunk with a transform.

Inter body copy, product names, navigation, prices, buttons, fields and checkout are unchanged. Image layers, campaign destinations, content, catalogue rules and commerce endpoints are unchanged. The collection's inline size utility is replaced by a shared editorial class to use the same scoped scale.

The existing compiled-app browser suite now checks 12 widths including breakpoint boundaries. It compares computed sizes with the same page temporarily using scale 1, asserts the 0.9 ratio for every editorial heading, checks that UI text sizes remain unchanged, and retains the loaded-font, overflow, mobile-art, focus, contrast and checkout-font isolation tests. It saves hero/campaign/featured screenshots at 390 and 1440px. These are automated Chromium checks with read-only commerce fixtures, not physical-device or live-payment tests.
