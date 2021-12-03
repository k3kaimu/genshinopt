import numpy as np
import matplotlib.pyplot as plt
from matplotlib import rc
rc('text', usetex=True)

dashlinevalue = 2*0.6 / (1+0.6*0.6*2) * 3.1

fig = plt.figure(figsize=(4*3,3))
ax = fig.add_subplot(131)
xs = np.linspace(0.05, 1, 200)
ax.plot(xs, xs*2/(1 + 2*xs**2) * 3.1)
ax.plot([0, 2], [dashlinevalue, dashlinevalue], linestyle='--')
ax.set_xlim(0, 1.05)
ax.set_xlabel("Critical rate or Critical damage/2 (\%)")
ax.set_ylabel("Damage increase (\%)")

ax = fig.add_subplot(132)
xs = np.linspace(1, 2.5, 200)
ax.plot(xs*100, 4.7/xs)
ax.plot([0, 300], [dashlinevalue, dashlinevalue], linestyle='--')
ax.set_xlim(95, 255)
ax.set_xlabel("Attack / Base attack (\%)")
ax.set_ylabel("Damage increase (\%)")

ax = fig.add_subplot(133)
xs = np.linspace(0, 1.5, 200)
ax.plot(xs*100, 4.7/(1 + xs))
ax.plot([0, 200], [dashlinevalue, dashlinevalue], linestyle='--')
ax.set_xlim(-5, 155)
ax.set_xlabel("Total damage buff (\%)")
ax.set_ylabel("Damage increase (\%)")
fig.tight_layout()
fig.savefig("efficiency.png")

