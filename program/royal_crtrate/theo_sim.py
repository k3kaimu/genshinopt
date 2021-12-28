import numpy as np
import matplotlib.pyplot as plt
import math
import random

from matplotlib import rc
rc('text', usetex=True)

def simulate(nTrial, p, x):
    crtcnt = 0
    noncrtcnt = 0
    for i in range(nTrial):
        q = min(p + noncrtcnt * x, 1)
        if random.uniform(0, 1) < q:
            # Critical
            crtcnt += 1
            noncrtcnt = 0
        else:
            # Non Critical
            noncrtcnt = min(noncrtcnt+1, 5)

    return crtcnt / nTrial


def theory(p, x):
    r = 1
    ret = 0
    for n in range(1, 5):
        q = min(p + (n-1) * x, 1)
        ret += n * q * r
        r *= (1 - q)

    p5 = min(p + 5 * x, 1)
    ret += r * (1 + 5*p5)/p5
    return 1/ret



incP = 0.08
theoPs = np.linspace(0, 1, 300)
simPs = np.linspace(0, 1, 20)

fig = plt.figure()
ax = fig.add_subplot(111)
ax.plot(theoPs, [theory(p, incP) for p in theoPs], label="theo.", color='C0')
ax.scatter(simPs, [simulate(10000, p, incP) for p in simPs], label="sim.", marker='x', color='C1')
ax.set_xlabel("Base CrtRate")
ax.set_ylabel("Effective Increase of CrtRate")
ax.legend()
fig.savefig("theo_sim.png")

# print(simulate(100000, 0.2, 0.08))
# print(theory(0.2, 0.08))


