# Spectral comb factoring

An interactive browser simulation of factoring a composite number with a comb of phase-shifted light pulses. The detector adds the pulses' fields by interference. The sum is bright only when a trial divisor `l` divides `N`, so the bright lines of the spectrum are the factors.

No build step and no dependencies: plain HTML, CSS and JavaScript.

## The physics

Pulse `m` of the train gets the phase `-2π · m² · N / l` (Gauss sum) or `-2π · m · N / l` (Fourier sum). The detector reads

```
A(l) = 1/(M+1) · Σ_{m=0..M} exp(i · phase_m)
```

- If `l` divides `N`, every phase is a multiple of 2π, all pulses add in step and `|A|² = 1`.
- If not, the phases scatter and the sum largely cancels.
- In the variable `u = N/l` the spectrum is periodic with period 1, so the frequency view repeats forever.

## Features

- `N` of any size up to 2000 digits, with exact BigInt arithmetic
- Scan window for `l` (up to 200,000), since a full scan to `N/2` is out of reach for large `N`
- Spectrum plot with true divisors and ghost factors marked
- Phasor diagram and pulse-phase view for any single `l`
- Frequency view over many periods
- Controls for pulse count, phase noise and Gauss or Fourier pattern
- Benchmark against trial division

## Limits

This simulates the maths of the experiment, not hardware. Real combs have finite linewidth, phase noise and bandwidth. The method needs pulse counts and timing precision that grow with the size of `N`, so it is a small-number demonstrator and no threat to RSA. A browser benchmark cannot show the one-shot parallel readout a real comb would have.

## Run locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy to GitHub Pages

1. Create a repository and push these files to the `main` branch.
2. In the repository, open Settings, then Pages, and set the source to GitHub Actions.
3. The workflow in `.github/workflows/pages.yml` publishes the site on every push to `main`.
4. The site appears at `https://<your-username>.github.io/<repository-name>/`.

## Prior work

- Factorization of numbers with the temporal Talbot effect (arXiv:0709.1906)
- Factorizing numbers with classical interference: several implementations in optics (arXiv:0811.2070)
- New factorization algorithm based on a continuous representation of truncated Gauss sums (arXiv:0811.1595)
- Factorization of numbers with Gauss sums: I. Mathematical background (arXiv:1210.6474)
- Physical Review Letters 100, 030202 (2008)

## License

MIT
